import type { Request, Response, NextFunction } from "express";
import logger from "../utils/loggerUtils";


/**
* Middleware to handle raw JSON body with control characters for blog routes
* This MUST run BEFORE express.json() to intercept and clean the raw body
* It bypasses express.json() by parsing the JSON itself after sanitization
*/
export const blogJsonParser = (
 req: Request,
 res: Response,
 next: NextFunction,
) => {
 logger.info("blogJsonParser middleware called", {
   path: req.path,
   method: req.method,
 });


 // Only process if content-type is application/json
 const contentType = req.headers["content-type"];
 if (!contentType || !contentType.includes("application/json")) {
   logger.info("Skipping blogJsonParser - not JSON content-type");
   return next();
 }


 let rawBody = "";
 let hasEnded = false;
 logger.info("Starting to collect raw body for blog request");


 // Safety timeout to prevent hanging
 const timeout = setTimeout(() => {
   if (!hasEnded) {
     logger.error("Blog JSON parser timeout - request took too long");
     res.status(408).json({
       success: false,
       statusCode: 408,
       message: "Request timeout",
       data: null,
     });
   }
 }, 30000); // 30 second timeout


 // Collect raw body data
 req.on("data", (chunk: Buffer) => {
   rawBody += chunk.toString("utf8");
   logger.info(`Received chunk: ${chunk.length} bytes`);
 });


 req.on("end", () => {
   hasEnded = true;
   clearTimeout(timeout);
   logger.info(
     `Raw body collection complete. Total size: ${rawBody.length} bytes`,
   );
   try {
     if (!rawBody || rawBody.trim().length === 0) {
       req.body = {};
       return next();
     }


     // Sanitize the raw JSON string to escape control characters
     const sanitizedJson = sanitizeRawJson(rawBody);


     // Now try to parse the sanitized JSON
     try {
       req.body = JSON.parse(sanitizedJson);
       logger.info("Successfully parsed blog JSON after sanitization");
       return next();
     } catch (parseError) {
       logger.error("Failed to parse JSON even after sanitization", {
         error: parseError,
       });
       return res.status(400).json({
         success: false,
         statusCode: 400,
         message:
           "Invalid JSON format. Please ensure your JSON is properly formatted.",
         data: null,
         requestInfo: {
           url: req.url,
           method: req.method,
           ip: req.ip,
         },
       });
     }
   } catch (error) {
     logger.error("Error in blog JSON parser middleware", error);
     return res.status(400).json({
       success: false,
       statusCode: 400,
       message: "Error processing request body",
       data: null,
       requestInfo: {
         url: req.url,
         method: req.method,
         ip: req.ip,
       },
     });
   }
 });


 req.on("error", (error) => {
   logger.error("Error reading request body", error);
   next(error);
 });
};


/**
* Sanitize raw JSON string by escaping control characters within string values
* This allows JSON.parse() to successfully parse JSON with literal newlines
* @param jsonString - The raw JSON string
* @returns Sanitized JSON string with escaped control characters
*/
function sanitizeRawJson(jsonString: string): string {
 let result = "";
 let inString = false;
 let escapeNext = false;


 for (let i = 0; i < jsonString.length; i++) {
   const char = jsonString[i];


   if (!inString) {
     // Not inside a string
     result += char;
     if (char === '"') {
       inString = true;
     }
   } else {
     // Inside a string
     if (escapeNext) {
       // Previous char was backslash, keep this char as-is
       result += char;
       escapeNext = false;
     } else if (char === "\\") {
       // Escape character
       result += char;
       escapeNext = true;
     } else if (char === '"') {
       // End of string
       result += char;
       inString = false;
     } else if (char === "\n") {
       // Literal newline in string - escape it
       result += "\\n";
     } else if (char === "\r") {
       // Carriage return - escape it
       result += "\\r";
     } else if (char === "\t") {
       // Tab - escape it
       result += "\\t";
     } else if (char) {
       // Check for other control characters and remove them
       const charCode = char.charCodeAt(0);
       if (
         charCode >= 0 &&
         charCode <= 31 &&
         charCode !== 10 &&
         charCode !== 13 &&
         charCode !== 9
       ) {
         // Other control characters - remove them
         // Don't add to result
       } else {
         // Regular character
         result += char;
       }
     }
   }
 }


 return result;
}



