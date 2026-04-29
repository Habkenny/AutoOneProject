import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "Auto One": "Auto One",
      "Workshops": "Workshops",
      "Car Wash": "Car Wash",
      "Rentals": "Rentals",
      "Imports": "Imports",
      "Sign In": "Sign In",
      "Sign Out": "Sign Out",
      "Home": "Home",
      "Book Now": "Book Now",
      "Dashboard": "Dashboard",
      "Find Services": "Find Services",
      "Welcome to Auto One": "Welcome to Auto One",
      "The all-in-one app for car services in the Middle East.": "The all-in-one app for car services in the Middle East.",
      "Get AI Estimate": "Get AI Estimate",
      "Language": "Language",
      "Login to book": "Login to book",
    }
  },
  ar: {
    translation: {
      "Auto One": "أوتو ون",
      "Workshops": "ورش العمل",
      "Car Wash": "غسيل السيارات",
      "Rentals": "تأجير السيارات",
      "Imports": "استيراد",
      "Sign In": "تسجيل الدخول",
      "Sign Out": "تسجيل الخروج",
      "Home": "الرئيسية",
      "Book Now": "احجز الآن",
      "Dashboard": "لوحة التحكم",
      "Find Services": "البحث عن خدمات",
      "Welcome to Auto One": "مرحبا بك في أوتو ون",
      "The all-in-one app for car services in the Middle East.": "التطبيق الشامل لخدمات السيارات في الشرق الأوسط.",
      "Get AI Estimate": "احصل على تقدير بالذكاء الاصطناعي",
      "Language": "اللغة",
      "Login to book": "سجل الدخول للحجز",
    }
  },
  de: {
    translation: {
      "Auto One": "Auto One",
      "Workshops": "Werkstätten",
      "Car Wash": "Autowäsche",
      "Rentals": "Vermietungen",
      "Imports": "Importe",
      "Sign In": "Anmelden",
      "Sign Out": "Abmelden",
      "Home": "Startseite",
      "Book Now": "Jetzt buchen",
      "Dashboard": "Dashboard",
      "Find Services": "Dienstleistungen finden",
      "Welcome to Auto One": "Willkommen bei Auto One",
      "The all-in-one app for car services in the Middle East.": "Die All-in-One-App für Autodienste im Nahen Osten.",
      "Get AI Estimate": "KI-Schätzung erhalten",
      "Language": "Sprache",
      "Login to book": "Melden Sie sich an, um zu buchen",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
