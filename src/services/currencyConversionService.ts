import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/config";
import logger from "../utils/loggerUtils";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

type RateCacheEntry = {
  rates: Record<string, number>;
  expiresAt: number;
};

const normalizeCurrency = (currency: string): string =>
  currency.trim().toLowerCase();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class CurrencyConversionService {
  private static cache = new Map<string, RateCacheEntry>();

  private static getCacheKey(baseCurrency: string): string {
    return normalizeCurrency(baseCurrency);
  }

  private static getCachedRates(
    baseCurrency: string,
  ): Record<string, number> | null {
    const cacheKey = this.getCacheKey(baseCurrency);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.rates;
    }
    return null;
  }

  private static setCachedRates(
    baseCurrency: string,
    rates: Record<string, number>,
  ): void {
    const cacheKey = this.getCacheKey(baseCurrency);
    this.cache.set(cacheKey, {
      rates,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  private static async fetchRates(
    baseCurrency: string,
  ): Promise<Record<string, number>> {
    const normalizedBase = normalizeCurrency(baseCurrency);
    const cached = this.getCachedRates(normalizedBase);
    if (cached) {
      return cached;
    }

    try {
      const exchangeRates = await stripe.exchangeRates.retrieve(normalizedBase);
      const rates = exchangeRates.rates || {};
      this.setCachedRates(normalizedBase, rates);
      return rates;
    } catch (error) {
      logger.error(
        "CurrencyConversionService: failed to fetch exchange rates",
        {
          baseCurrency: normalizedBase,
          error,
        },
      );
      throw error;
    }
  }

  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const normalizedFrom = normalizeCurrency(fromCurrency);
    const normalizedTo = normalizeCurrency(toCurrency);

    if (normalizedFrom === normalizedTo) {
      return 1;
    }

    try {
      const directRates = await this.fetchRates(normalizedFrom);
      const directRate = directRates[normalizedTo];
      if (typeof directRate === "number" && directRate > 0) {
        return directRate;
      }
    } catch (error) {
      logger.warn("CurrencyConversionService: direct rate lookup failed", {
        fromCurrency: normalizedFrom,
        toCurrency: normalizedTo,
        error,
      });
    }

    // Try inverse rate if direct lookup fails
    try {
      const inverseRates = await this.fetchRates(normalizedTo);
      const inverseRate = inverseRates[normalizedFrom];
      if (typeof inverseRate === "number" && inverseRate > 0) {
        return 1 / inverseRate;
      }
    } catch (error) {
      logger.warn("CurrencyConversionService: inverse rate lookup failed", {
        fromCurrency: normalizedFrom,
        toCurrency: normalizedTo,
        error,
      });
    }

    logger.warn(
      "CurrencyConversionService: falling back to 1:1 exchange rate",
      {
        fromCurrency: normalizedFrom,
        toCurrency: normalizedTo,
      },
    );
    return 1;
  }

  static async convert(params: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
  }): Promise<{
    convertedAmount: number;
    exchangeRate: number;
    originalAmount: number;
    originalCurrency: string;
    targetCurrency: string;
  }> {
    const { amount, fromCurrency, toCurrency } = params;
    const normalizedFrom = normalizeCurrency(fromCurrency);
    const normalizedTo = normalizeCurrency(toCurrency);

    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a finite number for conversion");
    }

    const exchangeRate = await this.getExchangeRate(
      normalizedFrom,
      normalizedTo,
    );
    const convertedAmount = amount * exchangeRate;

    logger.info("CurrencyConversionService: conversion performed", {
      originalAmount: amount,
      fromCurrency: normalizedFrom,
      toCurrency: normalizedTo,
      exchangeRate,
      convertedAmount,
    });

    return {
      convertedAmount,
      exchangeRate,
      originalAmount: amount,
      originalCurrency: normalizedFrom,
      targetCurrency: normalizedTo,
    };
  }

  static async getAllRates(
    baseCurrency: string,
  ): Promise<Record<string, number>> {
    try {
      return await this.fetchRates(baseCurrency);
    } catch {
      return {};
    }
  }

  static estimateConversionFee(amount: number): number {
    return amount * 0.01;
  }

  static async calculateTotalWithFees(params: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
  }): Promise<{
    originalAmount: number;
    convertedAmount: number;
    conversionFee: number;
    totalCost: number;
    exchangeRate: number;
  }> {
    const conversion = await this.convert(params);
    const conversionFee = this.estimateConversionFee(params.amount);
    return {
      originalAmount: params.amount,
      convertedAmount: conversion.convertedAmount,
      conversionFee,
      totalCost: conversion.convertedAmount + conversionFee,
      exchangeRate: conversion.exchangeRate,
    };
  }
}

export default CurrencyConversionService;
