import type { TranslationKeys } from "./uz";

export const en: TranslationKeys = {
  // Common
  common: {
    search: "Search",
    all: "All",
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    submit: "Submit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",
    or: "or",
    and: "and",
  },

  // Navigation
  nav: {
    home: "Home",
    listings: "Listings",
    buy: "Buy",
    rent: "Rent",
    mortgage: "Mortgage Calculator",
    marketPrices: "Market Prices",
    postListing: "Post Listing",
    agents: "Agents",
    agencies: "Agencies",
    login: "Login",
    register: "Register",
    profile: "Profile",
    favorites: "Favorites",
    myListings: "My Listings",
    dashboard: "Dashboard",
    messages: "Messages",
    notifications: "Notifications",
    logout: "Logout",
  },

  // Homepage
  home: {
    heroTitle: "Find your home in Uzbekistan",
    heroSubtitle: "Verified listings, real prices and professional agents — all on one platform.",
    searchPlaceholder: "City, district or street",
    propertyTypes: "Property Types",
    featuredListings: "Featured Listings",
    viewAll: "View All",
    byCity: "By City",
    verifiedListings: "Verified Listings",
    verifiedListingsDesc: "Every listing is moderated — no fake prices or photos.",
    realPrices: "Real Market Prices",
    realPricesDesc: "Price dynamics per 1 m² and growth indicators by area.",
    mortgageHelper: "Mortgage Helper",
    mortgageHelperDesc: "Calculate your monthly payment in seconds and choose a bank.",
    listingsCount: "listings",
  },

  // Deal types
  deal: {
    buy: "Buy",
    rent: "Rent",
    sale: "For Sale",
    forRent: "For Rent",
  },

  // Property types
  propertyType: {
    apartment: "Apartment",
    house: "House",
    office: "Office",
    land: "Land",
    commercial: "Commercial",
    apartments: "Apartments",
    houses: "Houses",
    offices: "Offices",
    lands: "Land Plots",
  },

  // Filters
  filters: {
    title: "Filters",
    dealType: "Deal Type",
    city: "City",
    allCities: "All Cities",
    propertyType: "Property Type",
    allTypes: "All Types",
    rooms: "Rooms",
    roomsMin: "Rooms (minimum)",
    anyRooms: "Any",
    maxPrice: "Max Price",
    minPrice: "Min Price",
    priceRange: "Price Range",
    area: "Area",
    minArea: "Min Area",
    maxArea: "Max Area",
    floor: "Floor",
    yearBuilt: "Year Built",
    condition: "Condition",
    clearFilters: "Clear Filters",
    apply: "Apply",
  },

  // Sorting
  sort: {
    title: "Sort by",
    recommended: "Recommended",
    newest: "Newest",
    cheapest: "Price: Low to High",
    expensive: "Price: High to Low",
    areaLow: "Area: Low to High",
    areaHigh: "Area: High to Low",
    popular: "Popularity",
    rating: "Rating",
  },

  // Listings page
  listings: {
    title: "Listings",
    saleListings: "Properties for Sale",
    rentListings: "Properties for Rent",
    foundListings: "listings found",
    noResults: "No Results",
    noResultsDesc: "Try expanding your filters or choosing a different city.",
    allListings: "All Listings",
  },

  // Property details
  property: {
    rooms: "Rooms",
    area: "Area",
    floor: "Floor",
    yearBuilt: "Year Built",
    description: "Description",
    amenities: "Amenities",
    similar: "Similar Properties",
    rating: "rating",
    mortgageEstimate: "Mortgage estimate",
    perMonth: "/mo",
    downPayment: "down payment",
    years: "years",
    contact: "Contact",
    call: "Call",
    message: "Message",
    share: "Share",
    calculateMortgage: "Calculate Mortgage",
    agent: "Agent",
    seller: "Seller",
    agency: "Agency",
    verified: "Verified",
    featured: "Featured",
    premium: "Premium",
  },

  // Post listing
  postListing: {
    title: "Post a Listing",
    subtitle: "Fill in the details — moderator will approve your listing within an hour.",
    listingTitle: "Listing Title",
    titlePlaceholder: "e.g., 3-bedroom apartment in Yunusabad",
    price: "Price",
    phone: "Phone",
    description: "Description",
    descriptionPlaceholder: "Describe the property in detail...",
    submitFree: "Post for Free",
    success: "Listing Submitted!",
    successDesc: "Your listing will appear on the site after moderator approval.",
  },

  // Mortgage calculator
  mortgage: {
    title: "Mortgage Calculator",
    subtitle: "Enter the price, down payment, term and interest rate — monthly payment is calculated instantly.",
    propertyPrice: "Property Price",
    downPayment: "Down Payment",
    loanTerm: "Loan Term",
    interestRate: "Annual Interest Rate",
    monthlyPayment: "Monthly Payment",
    loanAmount: "Loan Amount",
    totalPayment: "Total Payment",
    totalInterest: "Total Interest",
    disclaimer: "This is an estimate. Confirm exact terms with your bank.",
  },

  // Market prices
  market: {
    title: "Average Prices by City",
    subtitle: "Data is updated monthly based on listings and transactions on the platform. Prices per 1 m² in US dollars.",
    analysis: "Market Analysis",
    pricePerSqm: "/m²",
    yearlyChange: "Yearly Change",
    rentalYield: "Rental Yield",
    perYear: "per year",
  },

  // Auth
  auth: {
    login: "Login",
    register: "Register",
    email: "Email",
    phone: "Phone",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset Password",
    name: "Name",
    fullName: "Full Name",
    rememberMe: "Remember me",
    loginWithGoogle: "Login with Google",
    loginWithYandex: "Login with Yandex",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create Account",
    loginNow: "Login",
  },

  // User profile
  profile: {
    title: "Profile",
    settings: "Settings",
    avatar: "Avatar",
    personalInfo: "Personal Information",
    language: "Language",
    currency: "Currency",
    notifications: "Notifications",
    savedProperties: "Saved Properties",
    accountSettings: "Account Settings",
    changePassword: "Change Password",
    deleteAccount: "Delete Account",
  },

  // Favorites
  favorites: {
    title: "Favorites",
    empty: "No favorites yet",
    emptyDesc: "Click the heart icon to save listings you like.",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    folders: "Folders",
    allFavorites: "All Favorites",
    createFolder: "Create Folder",
    folderName: "Folder Name",
  },

  // Messages
  messages: {
    title: "Messages",
    empty: "No messages",
    emptyDesc: "You haven't chatted with anyone yet.",
    newMessage: "New Message",
    typeMessage: "Type a message...",
    send: "Send",
  },

  // Notifications
  notifications: {
    title: "Notifications",
    empty: "No notifications",
    markAllRead: "Mark all as read",
    newMessage: "New message",
    newLead: "New inquiry",
    listingApproved: "Listing approved",
    listingRejected: "Listing rejected",
    priceDropped: "Price dropped",
    newReview: "New review",
  },

  // Agent dashboard
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    myListings: "My Listings",
    analytics: "Analytics",
    leads: "Leads",
    messages: "Messages",
    settings: "Settings",
    totalListings: "Total Listings",
    activeListings: "Active",
    soldListings: "Sold",
    pendingListings: "Pending",
    totalViews: "Total Views",
    totalFavorites: "Total Favorites",
    totalLeads: "Total Leads",
    createListing: "Create Listing",
  },

  // Listing status
  listingStatus: {
    draft: "Draft",
    pending: "Pending",
    active: "Active",
    sold: "Sold",
    rented: "Rented",
    paused: "Paused",
    rejected: "Rejected",
    archived: "Archived",
  },

  // Admin
  admin: {
    title: "Admin Panel",
    dashboard: "Dashboard",
    listings: "Listings",
    moderation: "Moderation",
    users: "Users",
    agents: "Agents",
    agencies: "Agencies",
    reviews: "Reviews",
    analytics: "Analytics",
    content: "Content",
    settings: "Settings",
    approve: "Approve",
    reject: "Reject",
  },

  // Footer
  footer: {
    description: "The most trusted real estate platform in Uzbekistan. Verified listings, real prices and professional advice.",
    forBuyers: "For Buyers",
    forSellers: "For Sellers",
    saleHouses: "Houses for Sale",
    rentHouses: "Houses for Rent",
    freeListing: "Free Listing",
    contact: "Contact",
    allRightsReserved: "All rights reserved.",
  },

  // Errors
  errors: {
    notFound: "Page Not Found",
    notFoundDesc: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go Home",
    somethingWrong: "Something went wrong",
    tryAgain: "Try Again",
  },

  // Cities
  cities: {
    tashkent: "Tashkent",
    samarkand: "Samarkand",
    bukhara: "Bukhara",
    andijan: "Andijan",
    fergana: "Fergana",
    namangan: "Namangan",
    nukus: "Nukus",
    karshi: "Karshi",
    gulistan: "Gulistan",
    jizzakh: "Jizzakh",
    termez: "Termez",
    urgench: "Urgench",
  },

  // Amenities
  amenities: {
    parking: "Parking",
    balcony: "Balcony",
    terrace: "Terrace",
    airConditioning: "Air Conditioning",
    elevator: "Elevator",
    security: "Security",
    furnished: "Furnished",
    kitchen: "Kitchen",
    heating: "Heating",
    internet: "Internet",
    pool: "Pool",
    yard: "Yard",
    garage: "Garage",
    generator: "Generator",
    playground: "Playground",
  },

  // Currencies
  currencies: {
    uzs: "UZS (som)",
    usd: "USD (dollar)",
    eur: "EUR (euro)",
  },

  // Languages
  languages: {
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English",
  },
} as const;
