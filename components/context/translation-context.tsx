"use client"; // Ensure this is the very first line

import { createContext, useContext, useState, useEffect } from "react";

const TranslationContext = createContext<any>(null);

const translations: Record<
  string,
  Record<
    string,
    string | { title: string; description: string; subSteps: Record<string, string> }
  >
> = {
  en: {
    business_description: "What best describes your business?",
      back: "Back",
      empire_name_title: "So... what do we call your empire? 🏰",
      empire_name_subtitle: "Even if it's just starting, it's still awesome.",
      business_type_question: "What type of business is it?",
      awesome: "Awesome",
      ready_message: "You're ready to take your business to the next level",
      jump_to_dashboard: "Let's jump into your dashboard. I'll be here to help along the way!",
      help_question: "What do you want IndieTracker to help you with?",
      name_prompt: "Let's start with your name!",
      name_sub: "Or your superhero name, we don't judge 😉",
      setup_steps: "Let's set up your workspace in just a few steps.",
      good_morning: "Good morning",
      business_summary: "Here's how your",
      is_doing_today: "is doing today",
      new_sale: "New Sale",
      start_shift: "Start Shift",
      add_expense: "Add Expense",
      add_new_product: "Add New Product",
      name: "Name",
      price: "Price",
      icon: "Icon",
      other: "Other",
      add_product: "Add Product",
      edit_product: "Edit Product",
      update_product: "Update Product",
      subtotal: "Subtotal",
      sale_summary: "Sale Summary",
      no_items: "No items added yet",
      total: "Total",
      track_costs: "Track your business costs like a pro",
      quick_add_suggestions: "Quick Add Suggestions",
      expense_summary: "Expense Summary",
      amount: "Amount:",
      monthly_total: "Monthly Total:",
      expense_type: "Expense Type:",
      every_dinar_counts: "Every dinar counts 💸",
      recurrence: "Recurrence",
      recurring_help: "You can automate daily/weekly/monthly expenses to save time and ensure consistent tracking.",
      expense_title: "Expense Title",
      amount_dinar: "Amount (in Dinars)",
      personal: "Personal",
      business: "Business",
      date: "Date",
      pick_date: "Pick a date",
      make_recurring: "Make it recurring?",
      recurrence_pattern: "Recurrence Pattern",
      start_date: "Start Date",
      end_date: "End Date (Optional)",
      notes_optional: "Notes (Optional)",
    dashboard: "Dashboard",
    habits: "Habits",
    community: "Community",
    challenges: "Challenges",
    simulator: "Simulator",
    marketplace: "Marketplace",
    menu: "Menu",
    profile: "Profile",
    logout: "Logout",
    "Total Projects": "Total Projects",
    "Active Projects": "Active Projects",
    Completed: "Completed",
    "Monthly Growth": "Monthly Growth",
    "Project Progress Overview": "Project Progress Overview",
    "In Progress": "In Progress",
    Archived: "Archived",
    Active: "Active",
    Progress: "Progress",
    project_basics: {
        title: "Project Basics",
        description: "Let's start with the essentials",
        subSteps: {
          project_identity: "Project Identity",
          project_overview: "Project Overview",
          name: "Name",
          description: "Description",
          type: "Type",
          customType: "Custom Type",
        },
      },
      vision_details: {
        title: "Vision & Details",
        description: "Tell us more about your goals",
        subSteps: {
          project_tags: "Project Tags",
          vision_impact: "Vision & Impact",
          tags: "Tags",
          vision: "Vision",
          impact: "Impact",
        },
      },
      business_model: {
        title: "Business Model",
        description: "How will it generate value?",
        subSteps: {
          revenue_model: "Revenue Model",
          financial_planning: "Financial Planning",
          revenueModel: "Revenue Model",
          customRevenue: "Custom Revenue",
          budgetRange: "Budget Range",
          fundingSource: "Funding Source",
        },
      },
      team_timeline: {
        title: "Team & Timeline",
        description: "Planning and execution",
        subSteps: {
          timeline_status: "Timeline & Status",
          team_milestones: "Team & Milestones",
          timeline: "Timeline",
          status: "Status",
          teamType: "Team Type",
          teamMembers: "Team Members",
          milestones: "Milestones",
        },
      },
      media_visibility: {
        title: "Media & Visibility",
        description: "Show off your project",
        subSteps: {
          project_visibility: "Project Visibility",
          media_plan: "Media & Plan",
          visibility: "Visibility",
          location: "Location",
          collaborations: "Collaborations",
          media: "Media",
          planType: "Plan Type",
        },
      },
      
    },
  
  ar: {
    "What best describes your business?": "ما هو الوصف الأفضل لنشاطك التجاري؟",
    "Back": "رجوع",
    "So... what do we call your empire? 🏰": "إذاً... ماذا نسمي إمبراطوريتك؟ 🏰",
    "Even if it's just starting, it's still awesome.": "حتى وإن كانت في بدايتها، فهي رائعة.",
    "What type of business is it?": "ما نوع العمل الخاص بك؟",
    "Awesome": "رائع",
    "You're ready to take your business to the next level": "أنت مستعد للانتقال بمشروعك للمرحلة التالية",
    "Let's jump into your dashboard. I'll be here to help along the way!": "لننطلق إلى لوحة التحكم. سأكون هنا لمساعدتك!",
    "What do you want IndieTracker to help you with?": "بماذا تريد من IndieTracker مساعدتك؟",
    "Let's start with your name!": "لنبدأ باسمك!",
    "Or your superhero name, we don't judge 😉": "أو اسمك الخارق، لا مشكلة 😉",
    "Let's set up your workspace in just a few steps": "لنقم بإعداد مساحتك في بضع خطوات.",
    "Good morning": "صباح الخير",
    "Here's how your": "إليك كيف تسير أمور",
    "is doing today": "الخاصة بك اليوم",
    "New Sale": "عملية بيع جديدة",
    "Start Shift": "بدء المناوبة",
    "Add Expense": "إضافة مصروف",
    "Add New Product": "إضافة منتج جديد",
    "Name": "الاسم",
    "Price": "السعر",
    "Icon": "الأيقونة",
    "Other": "أخرى",
    "Hours Worked": "ساعات العمل",
    "Today's Sales": "مبيعات اليوم",
    "Expenses": "المصاريف",
    "Net Profit": "صافي الربح",
    "Add Product": "إضافة المنتج",
    "Edit Product": "تعديل المنتج",
    "Update Product": "تحديث المنتج",
    "Subtotal": "المجموع الفرعي",
    "Sale Summary": "ملخص البيع",
    "No items added yet": "لم يتم إضافة أي عناصر بعد",
    "Total": "الإجمالي",
    "Track your business costs like a pro": "تابع تكاليف عملك كالمحترفين",
    "You can automate daily/weekly/monthly expenses to save time and ensure consistent tracking.": "يمكنك أتمتة المصاريف اليومية/الأسبوعية/الشهرية لتوفير الوقت وضمان التتبع المستمر.",
    "Expense Title": "عنوان المصروف",
    "Amount (in Dinars)": "المبلغ (بالدينار)",
    "Expense Type": "نوع المصروف",
    "Personal": "شخصي",
    "Business": "عمل",
    "Date": "التاريخ",
    "Pick a date": "اختر تاريخًا",
    "Make it recurring?": "هل تريده متكررًا؟",
    "Recurrence Pattern": "نمط التكرار",
    "Start Date": "تاريخ البدء",
    "End Date (Optional)": "تاريخ الانتهاء (اختياري)",
    "Notes (Optional)": "ملاحظات (اختياري)",
    "Quick Add Suggestions": "اقتراحات الإضافة السريعة",
    "Expense Summary": "ملخص المصاريف",
    "Amount": "المبلغ:",
    "Monthly Total": "الإجمالي الشهري:",
    "ExpenseType": "نوع المصروف:",
    "Every dinar counts 💸": "كل دينار مهم 💸",
    "Recurrence": "التكرار.",
    dashboard: "لوحة التحكم",
    transactions: "المعاملات",
    time_tracker: "متتبع الوقت",
    habits: "العادات",
    community: "المجتمع",
    challenges: "التحديات",
    simulator: "المحاكي",
    marketplace: "السوق",
    menu: "القائمة",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    "Total Projects": "إجمالي المشاريع",
    "Active Projects": "المشاريع النشطة",
    Completed: "المكتملة",
    "Monthly Growth": "النمو الشهري",
    "Project Progress Overview": "نظرة عامة على تقدم المشروع",
    "In Progress": "قيد التنفيذ",
    Archived: "المؤرشفة",
    Active: "نشط",
    Progress: "التقدم",
  },
};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("locale");
      if (savedLocale) setLocale(savedLocale);
    }
  }, []);
  

  const changeLanguage = (lang: string) => {
    setLocale(lang);
    localStorage.setItem("locale", lang);
  };

  const t = (key: string) => translations[locale][key] || key;

  return (
    <TranslationContext.Provider value={{ t, changeLanguage, locale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
