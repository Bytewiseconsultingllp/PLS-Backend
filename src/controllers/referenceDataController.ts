import { SUCCESSCODE } from "../constants";
import { httpResponse } from "../utils/apiResponseUtils";
import { asyncHandler } from "../utils/asyncHandlerUtils";

/**
 * Reference Data Controller
 * Provides all enum values for frontend forms
 */
export default {
  /**
   * @route   GET /api/reference-data
   * @desc    Get all reference data (enums) for frontend
   * @access  Public
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  getAllReferenceData: asyncHandler(async (req, res) => {
    const referenceData = {
      serviceCategories: [
        {
          value: "SOFTWARE_DEVELOPMENT",
          label: "Software Development",
          description: "Custom software solutions and applications",
        },
        {
          value: "DATA_AND_ANALYTICS",
          label: "Data & Analytics",
          description: "Data processing, analytics, and business intelligence",
        },
        {
          value: "CLOUD_AND_DEVOPS",
          label: "Cloud & DevOps",
          description: "Cloud infrastructure and DevOps solutions",
        },
        {
          value: "EMERGING_TECHNOLOGIES",
          label: "Emerging Technologies",
          description: "AI, ML, IoT, and cutting-edge technologies",
        },
        {
          value: "CREATIVE_AND_DESIGN",
          label: "Creative & Design",
          description: "UI/UX design and creative services",
        },
        {
          value: "DIGITAL_MARKETING",
          label: "Digital Marketing",
          description: "Digital marketing and online presence solutions",
        },
      ],

      industryCategories: [
        {
          value: "HEALTHCARE_AND_LIFE_SCIENCES",
          label: "Healthcare & Life Sciences",
          subIndustries: [
            {
              value: "HEALTHCARE_PROVIDERS",
              label: "Healthcare Providers",
            },
            {
              value: "PHARMACEUTICALS",
              label: "Pharmaceuticals",
            },
            {
              value: "MEDICAL_DEVICES",
              label: "Medical Devices",
            },
            {
              value: "BIOTECHNOLOGY",
              label: "Biotechnology",
            },
            {
              value: "HEALTH_INSURANCE",
              label: "Health Insurance",
            },
          ],
        },
        {
          value: "FINANCIAL_SERVICES",
          label: "Financial Services",
          subIndustries: [
            {
              value: "BANKING",
              label: "Banking",
            },
            {
              value: "INSURANCE",
              label: "Insurance",
            },
            {
              value: "INVESTMENT_MANAGEMENT",
              label: "Investment Management",
            },
            {
              value: "PAYMENTS",
              label: "Payments",
            },
            {
              value: "LENDING",
              label: "Lending",
            },
            {
              value: "BLOCKCHAIN_AND_CRYPTO",
              label: "Blockchain & Crypto",
            },
          ],
        },
        {
          value: "RETAIL_AND_ECOMMERCE",
          label: "Retail & E-commerce",
          subIndustries: [
            {
              value: "ONLINE_RETAIL",
              label: "Online Retail",
            },
            {
              value: "BRICK_AND_MORTAR",
              label: "Brick and Mortar",
            },
            {
              value: "OMNICHANNEL",
              label: "Omnichannel",
            },
            {
              value: "FASHION_AND_APPAREL",
              label: "Fashion & Apparel",
            },
            {
              value: "CONSUMER_GOODS",
              label: "Consumer Goods",
            },
          ],
        },
        {
          value: "MANUFACTURING",
          label: "Manufacturing",
          subIndustries: [
            {
              value: "AUTOMOTIVE",
              label: "Automotive",
            },
            {
              value: "INDUSTRIAL_EQUIPMENT",
              label: "Industrial Equipment",
            },
            {
              value: "ELECTRONICS",
              label: "Electronics",
            },
            {
              value: "AEROSPACE_AND_DEFENSE",
              label: "Aerospace & Defense",
            },
            {
              value: "CHEMICAL_AND_MATERIALS",
              label: "Chemical & Materials",
            },
            {
              value: "SMART_MANUFACTURING",
              label: "Smart Manufacturing",
            },
          ],
        },
        {
          value: "EDUCATION",
          label: "Education",
          subIndustries: [
            {
              value: "K_12_EDUCATION",
              label: "K-12 Education",
            },
            {
              value: "HIGHER_EDUCATION",
              label: "Higher Education",
            },
            {
              value: "PROFESSIONAL_TRAINING",
              label: "Professional Training",
            },
            {
              value: "EDTECH",
              label: "EdTech",
            },
            {
              value: "RESEARCH_AND_DEVELOPMENT",
              label: "Research & Development",
            },
          ],
        },
        {
          value: "GOVERNMENT_AND_PUBLIC_SECTOR",
          label: "Government & Public Sector",
          subIndustries: [
            {
              value: "FEDERAL_GOVERNMENT",
              label: "Federal Government",
            },
            {
              value: "STATE_AND_LOCAL",
              label: "State & Local",
            },
            {
              value: "PUBLIC_HEALTHCARE",
              label: "Public Healthcare",
            },
            {
              value: "PUBLIC_INFRASTRUCTURE",
              label: "Public Infrastructure",
            },
            {
              value: "CIVIC_TECHNOLOGY",
              label: "Civic Technology",
            },
          ],
        },
      ],

      technologyCategories: [
        {
          value: "FRONTEND",
          label: "Frontend",
          technologies: [
            { value: "REACT", label: "React" },
            { value: "ANGULAR", label: "Angular" },
            { value: "VUE_JS", label: "Vue.js" },
            { value: "NEXT_JS", label: "Next.js" },
            { value: "SVELTE", label: "Svelte" },
            { value: "JQUERY", label: "jQuery" },
          ],
        },
        {
          value: "BACKEND",
          label: "Backend",
          technologies: [
            { value: "NODE_JS", label: "Node.js" },
            { value: "PYTHON_DJANGO", label: "Python/Django" },
            { value: "JAVA_SPRING", label: "Java/Spring" },
            { value: "PHP_LARAVEL", label: "PHP/Laravel" },
            { value: "RUBY_ON_RAILS", label: "Ruby on Rails" },
            { value: "DOTNET_CORE", label: ".NET Core" },
          ],
        },
        {
          value: "DATABASE",
          label: "Database",
          technologies: [
            { value: "POSTGRESQL", label: "PostgreSQL" },
            { value: "MONGODB", label: "MongoDB" },
            { value: "MYSQL", label: "MySQL" },
            { value: "REDIS", label: "Redis" },
            { value: "FIREBASE", label: "Firebase" },
            { value: "SQL_SERVER", label: "SQL Server" },
          ],
        },
        {
          value: "AI_AND_DATA_SCIENCE",
          label: "AI & Data Science",
          technologies: [
            { value: "TENSORFLOW", label: "TensorFlow" },
            { value: "PYTORCH", label: "PyTorch" },
            { value: "OPENAI_API", label: "OpenAI API" },
            { value: "SCIKIT_LEARN", label: "Scikit-learn" },
            { value: "PANDAS", label: "Pandas" },
            { value: "COMPUTER_VISION", label: "Computer Vision" },
          ],
        },
        {
          value: "DEVOPS_AND_INFRASTRUCTURE",
          label: "DevOps & Infrastructure",
          technologies: [
            { value: "AWS", label: "AWS" },
            { value: "DOCKER", label: "Docker" },
            { value: "KUBERNETES", label: "Kubernetes" },
            { value: "GITHUB_ACTIONS", label: "GitHub Actions" },
            { value: "TERRAFORM", label: "Terraform" },
            { value: "JENKINS", label: "Jenkins" },
          ],
        },
        {
          value: "MOBILE",
          label: "Mobile",
          technologies: [
            { value: "REACT_NATIVE", label: "React Native" },
            { value: "FLUTTER", label: "Flutter" },
            { value: "SWIFT_IOS", label: "Swift (iOS)" },
            { value: "KOTLIN_ANDROID", label: "Kotlin (Android)" },
            { value: "XAMARIN", label: "Xamarin" },
            { value: "IONIC", label: "Ionic" },
          ],
        },
      ],

      featureCategories: [
        {
          value: "USER_MANAGEMENT",
          label: "User Management",
          features: [
            { value: "AUTHENTICATION", label: "Authentication" },
            {
              value: "ROLE_BASED_ACCESS_CONTROL",
              label: "Role-based Access Control",
            },
            { value: "USER_PROFILES", label: "User Profiles" },
            { value: "SOCIAL_LOGIN", label: "Social Login" },
          ],
        },
        {
          value: "CONTENT_MANAGEMENT",
          label: "Content Management",
          features: [
            { value: "RICH_TEXT_EDITOR", label: "Rich Text Editor" },
            { value: "MEDIA_LIBRARY", label: "Media Library" },
            { value: "CONTENT_VERSIONING", label: "Content Versioning" },
            { value: "CONTENT_SCHEDULING", label: "Content Scheduling" },
          ],
        },
        {
          value: "ECOMMERCE",
          label: "E-commerce",
          features: [
            { value: "PRODUCT_CATALOG", label: "Product Catalog" },
            { value: "SHOPPING_CART", label: "Shopping Cart" },
            { value: "PAYMENT_PROCESSING", label: "Payment Processing" },
            { value: "INVENTORY_MANAGEMENT", label: "Inventory Management" },
          ],
        },
        {
          value: "ANALYTICS_AND_REPORTING",
          label: "Analytics & Reporting",
          features: [
            { value: "DASHBOARD", label: "Dashboard" },
            { value: "CUSTOM_REPORTS", label: "Custom Reports" },
            { value: "USER_ANALYTICS", label: "User Analytics" },
            { value: "PERFORMANCE_METRICS", label: "Performance Metrics" },
          ],
        },
        {
          value: "COMMUNICATION",
          label: "Communication",
          features: [
            { value: "EMAIL_NOTIFICATIONS", label: "Email Notifications" },
            { value: "IN_APP_MESSAGING", label: "In-App Messaging" },
            { value: "PUSH_NOTIFICATIONS", label: "Push Notifications" },
            {
              value: "COMMENTS_AND_FEEDBACK",
              label: "Comments & Feedback",
            },
          ],
        },
        {
          value: "INTEGRATION_AND_API",
          label: "Integration & API",
          features: [
            { value: "RESTFUL_API", label: "RESTful API" },
            { value: "WEBHOOKS", label: "Webhooks" },
            {
              value: "THIRD_PARTY_INTEGRATIONS",
              label: "Third-party Integrations",
            },
            { value: "DATA_IMPORT_EXPORT", label: "Data Import/Export" },
          ],
        },
      ],
    };

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Reference data retrieved successfully",
      referenceData,
    );
  }),

  /**
   * @route   GET /api/reference-data/service-categories
   * @desc    Get only service categories
   * @access  Public
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  getServiceCategories: asyncHandler(async (req, res) => {
    const serviceCategories = [
      {
        value: "SOFTWARE_DEVELOPMENT",
        label: "Software Development",
        description: "Custom software solutions and applications",
      },
      {
        value: "DATA_AND_ANALYTICS",
        label: "Data & Analytics",
        description: "Data processing, analytics, and business intelligence",
      },
      {
        value: "CLOUD_AND_DEVOPS",
        label: "Cloud & DevOps",
        description: "Cloud infrastructure and DevOps solutions",
      },
      {
        value: "EMERGING_TECHNOLOGIES",
        label: "Emerging Technologies",
        description: "AI, ML, IoT, and cutting-edge technologies",
      },
      {
        value: "CREATIVE_AND_DESIGN",
        label: "Creative & Design",
        description: "UI/UX design and creative services",
      },
      {
        value: "DIGITAL_MARKETING",
        label: "Digital Marketing",
        description: "Digital marketing and online presence solutions",
      },
    ];

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service categories retrieved successfully",
      serviceCategories,
    );
  }),

  /**
   * @route   GET /api/reference-data/industry-categories
   * @desc    Get only industry categories with sub-industries
   * @access  Public
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  getIndustryCategories: asyncHandler(async (req, res) => {
    const industryCategories = [
      {
        value: "HEALTHCARE_AND_LIFE_SCIENCES",
        label: "Healthcare & Life Sciences",
        subIndustries: [
          {
            value: "HEALTHCARE_PROVIDERS",
            label: "Healthcare Providers",
          },
          {
            value: "PHARMACEUTICALS",
            label: "Pharmaceuticals",
          },
          {
            value: "MEDICAL_DEVICES",
            label: "Medical Devices",
          },
          {
            value: "BIOTECHNOLOGY",
            label: "Biotechnology",
          },
          {
            value: "HEALTH_INSURANCE",
            label: "Health Insurance",
          },
        ],
      },
      {
        value: "FINANCIAL_SERVICES",
        label: "Financial Services",
        subIndustries: [
          {
            value: "BANKING",
            label: "Banking",
          },
          {
            value: "INSURANCE",
            label: "Insurance",
          },
          {
            value: "INVESTMENT_MANAGEMENT",
            label: "Investment Management",
          },
          {
            value: "PAYMENTS",
            label: "Payments",
          },
          {
            value: "LENDING",
            label: "Lending",
          },
          {
            value: "BLOCKCHAIN_AND_CRYPTO",
            label: "Blockchain & Crypto",
          },
        ],
      },
      {
        value: "RETAIL_AND_ECOMMERCE",
        label: "Retail & E-commerce",
        subIndustries: [
          {
            value: "ONLINE_RETAIL",
            label: "Online Retail",
          },
          {
            value: "BRICK_AND_MORTAR",
            label: "Brick and Mortar",
          },
          {
            value: "OMNICHANNEL",
            label: "Omnichannel",
          },
          {
            value: "FASHION_AND_APPAREL",
            label: "Fashion & Apparel",
          },
          {
            value: "CONSUMER_GOODS",
            label: "Consumer Goods",
          },
        ],
      },
      {
        value: "MANUFACTURING",
        label: "Manufacturing",
        subIndustries: [
          {
            value: "AUTOMOTIVE",
            label: "Automotive",
          },
          {
            value: "INDUSTRIAL_EQUIPMENT",
            label: "Industrial Equipment",
          },
          {
            value: "ELECTRONICS",
            label: "Electronics",
          },
          {
            value: "AEROSPACE_AND_DEFENSE",
            label: "Aerospace & Defense",
          },
          {
            value: "CHEMICAL_AND_MATERIALS",
            label: "Chemical & Materials",
          },
          {
            value: "SMART_MANUFACTURING",
            label: "Smart Manufacturing",
          },
        ],
      },
      {
        value: "EDUCATION",
        label: "Education",
        subIndustries: [
          {
            value: "K_12_EDUCATION",
            label: "K-12 Education",
          },
          {
            value: "HIGHER_EDUCATION",
            label: "Higher Education",
          },
          {
            value: "PROFESSIONAL_TRAINING",
            label: "Professional Training",
          },
          {
            value: "EDTECH",
            label: "EdTech",
          },
          {
            value: "RESEARCH_AND_DEVELOPMENT",
            label: "Research & Development",
          },
        ],
      },
      {
        value: "GOVERNMENT_AND_PUBLIC_SECTOR",
        label: "Government & Public Sector",
        subIndustries: [
          {
            value: "FEDERAL_GOVERNMENT",
            label: "Federal Government",
          },
          {
            value: "STATE_AND_LOCAL",
            label: "State & Local",
          },
          {
            value: "PUBLIC_HEALTHCARE",
            label: "Public Healthcare",
          },
          {
            value: "PUBLIC_INFRASTRUCTURE",
            label: "Public Infrastructure",
          },
          {
            value: "CIVIC_TECHNOLOGY",
            label: "Civic Technology",
          },
        ],
      },
    ];

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Industry categories retrieved successfully",
      industryCategories,
    );
  }),

  /**
   * @route   GET /api/reference-data/technology-categories
   * @desc    Get only technology categories with items
   * @access  Public
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  getTechnologyCategories: asyncHandler(async (req, res) => {
    const technologyCategories = [
      {
        value: "FRONTEND",
        label: "Frontend",
        technologies: [
          { value: "REACT", label: "React" },
          { value: "ANGULAR", label: "Angular" },
          { value: "VUE_JS", label: "Vue.js" },
          { value: "NEXT_JS", label: "Next.js" },
          { value: "SVELTE", label: "Svelte" },
          { value: "JQUERY", label: "jQuery" },
        ],
      },
      {
        value: "BACKEND",
        label: "Backend",
        technologies: [
          { value: "NODE_JS", label: "Node.js" },
          { value: "PYTHON_DJANGO", label: "Python/Django" },
          { value: "JAVA_SPRING", label: "Java/Spring" },
          { value: "PHP_LARAVEL", label: "PHP/Laravel" },
          { value: "RUBY_ON_RAILS", label: "Ruby on Rails" },
          { value: "DOTNET_CORE", label: ".NET Core" },
        ],
      },
      {
        value: "DATABASE",
        label: "Database",
        technologies: [
          { value: "POSTGRESQL", label: "PostgreSQL" },
          { value: "MONGODB", label: "MongoDB" },
          { value: "MYSQL", label: "MySQL" },
          { value: "REDIS", label: "Redis" },
          { value: "FIREBASE", label: "Firebase" },
          { value: "SQL_SERVER", label: "SQL Server" },
        ],
      },
      {
        value: "AI_AND_DATA_SCIENCE",
        label: "AI & Data Science",
        technologies: [
          { value: "TENSORFLOW", label: "TensorFlow" },
          { value: "PYTORCH", label: "PyTorch" },
          { value: "OPENAI_API", label: "OpenAI API" },
          { value: "SCIKIT_LEARN", label: "Scikit-learn" },
          { value: "PANDAS", label: "Pandas" },
          { value: "COMPUTER_VISION", label: "Computer Vision" },
        ],
      },
      {
        value: "DEVOPS_AND_INFRASTRUCTURE",
        label: "DevOps & Infrastructure",
        technologies: [
          { value: "AWS", label: "AWS" },
          { value: "DOCKER", label: "Docker" },
          { value: "KUBERNETES", label: "Kubernetes" },
          { value: "GITHUB_ACTIONS", label: "GitHub Actions" },
          { value: "TERRAFORM", label: "Terraform" },
          { value: "JENKINS", label: "Jenkins" },
        ],
      },
      {
        value: "MOBILE",
        label: "Mobile",
        technologies: [
          { value: "REACT_NATIVE", label: "React Native" },
          { value: "FLUTTER", label: "Flutter" },
          { value: "SWIFT_IOS", label: "Swift (iOS)" },
          { value: "KOTLIN_ANDROID", label: "Kotlin (Android)" },
          { value: "XAMARIN", label: "Xamarin" },
          { value: "IONIC", label: "Ionic" },
        ],
      },
    ];

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technology categories retrieved successfully",
      technologyCategories,
    );
  }),

  /**
   * @route   GET /api/reference-data/feature-categories
   * @desc    Get only feature categories with items
   * @access  Public
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  getFeatureCategories: asyncHandler(async (req, res) => {
    const featureCategories = [
      {
        value: "USER_MANAGEMENT",
        label: "User Management",
        features: [
          { value: "AUTHENTICATION", label: "Authentication" },
          {
            value: "ROLE_BASED_ACCESS_CONTROL",
            label: "Role-based Access Control",
          },
          { value: "USER_PROFILES", label: "User Profiles" },
          { value: "SOCIAL_LOGIN", label: "Social Login" },
        ],
      },
      {
        value: "CONTENT_MANAGEMENT",
        label: "Content Management",
        features: [
          { value: "RICH_TEXT_EDITOR", label: "Rich Text Editor" },
          { value: "MEDIA_LIBRARY", label: "Media Library" },
          { value: "CONTENT_VERSIONING", label: "Content Versioning" },
          { value: "CONTENT_SCHEDULING", label: "Content Scheduling" },
        ],
      },
      {
        value: "ECOMMERCE",
        label: "E-commerce",
        features: [
          { value: "PRODUCT_CATALOG", label: "Product Catalog" },
          { value: "SHOPPING_CART", label: "Shopping Cart" },
          { value: "PAYMENT_PROCESSING", label: "Payment Processing" },
          { value: "INVENTORY_MANAGEMENT", label: "Inventory Management" },
        ],
      },
      {
        value: "ANALYTICS_AND_REPORTING",
        label: "Analytics & Reporting",
        features: [
          { value: "DASHBOARD", label: "Dashboard" },
          { value: "CUSTOM_REPORTS", label: "Custom Reports" },
          { value: "USER_ANALYTICS", label: "User Analytics" },
          { value: "PERFORMANCE_METRICS", label: "Performance Metrics" },
        ],
      },
      {
        value: "COMMUNICATION",
        label: "Communication",
        features: [
          { value: "EMAIL_NOTIFICATIONS", label: "Email Notifications" },
          { value: "IN_APP_MESSAGING", label: "In-App Messaging" },
          { value: "PUSH_NOTIFICATIONS", label: "Push Notifications" },
          {
            value: "COMMENTS_AND_FEEDBACK",
            label: "Comments & Feedback",
          },
        ],
      },
      {
        value: "INTEGRATION_AND_API",
        label: "Integration & API",
        features: [
          { value: "RESTFUL_API", label: "RESTful API" },
          { value: "WEBHOOKS", label: "Webhooks" },
          {
            value: "THIRD_PARTY_INTEGRATIONS",
            label: "Third-party Integrations",
          },
          { value: "DATA_IMPORT_EXPORT", label: "Data Import/Export" },
        ],
      },
    ];

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Feature categories retrieved successfully",
      featureCategories,
    );
  }),
};
