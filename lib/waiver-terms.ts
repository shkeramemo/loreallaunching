export type WaiverLanguage = "ar" | "en";

export type WaiverContent = {
  language: WaiverLanguage;
  htmlLang: string;
  dir: "rtl" | "ltr";
  eventLabel: string;
  documentTitle: string;
  eventIntroduction: string;
  acceptanceStatement: string;
  signatureAcknowledgement: string;
  dataProcessingNotice: string;
  privacyPolicyLabel: string;
  terms: readonly { body: string }[];
  ui: {
    languageLabel: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    requiredReading: string;
    termsTitle: string;
    openTerms: string;
    termsRead: string;
    termsNotRead: string;
    consentLabel: string;
    signatureTitle: string;
    signaturePlaceholder: string;
    signatureAriaLabel: string;
    clear: string;
    reset: string;
    submit: string;
    submitting: string;
    nextAttendee: string;
    successMessage: string;
    serverValidationMessage: string;
    submitError: string;
    networkError: string;
    readTermsConfirm: string;
    closeTerms: string;
    moreInformation: string;
  };
  validation: {
    fullName: string;
    termsRead: string;
    consentWaiver: string;
    signatureDataUrl: string;
  };
  pdf: {
    headerLabel: string;
    footerLabel: string;
    signedBy: string;
    handwrittenSignature: string;
    documentReference: string;
  };
};

const englishTerms = [
  {
    body: "I acknowledge that my image will be captured (both photos and videos). For the purpose of this Release, “Image” shall be defined as covering all my identification attributes, especially my image, surname, first name, voice, signature, likeness and qualities, this list being non-exhaustive.",
  },
  {
    body: "I agree to authorize L’Oréal its parent company, affiliates, sister companies, subsidiaries and in general to the L’Oréal Group to use, reproduce, edit and display, in whole or in part, my Image for marketing and advertising purposes both online and offline on any medium whatsoever, and on any format whether for internal use, external use, public event or other and in general for the purpose of advertising and promoting L’Oréal, without any limitation with regard to the number of reproductions, representations and adaptations made.",
  },
  {
    body: "Such usage by L’Oréal shall be limited to the Image collected and any other tangible or non-tangible materials produced within the scope of the Event (the “Material”), that may associate any of L’Oréal’s trademarks and distinctive signs.",
  },
  {
    body: "This Release includes the right for L’Oréal to make any changes, additions, deletions, cropping etc., that it deems necessary to my original Image and Material and is granted without any limitation with regard to the number of reproductions, representations and adaptations made.",
  },
  {
    body: "Such usage rights shall be granted to L’Oréal, its parent company, affiliates, sister companies, subsidiaries and in general to the L’Oréal Group, free of charge, worldwide and for an unlimited duration and shall not cause L’Oréal to be liable in any way in relation to any such publication and/or use of my Image.",
  },
  {
    body: "I acknowledge and expressly agree that:\n• The Material and the intellectual property rights relating to the Material shall remain L’Oréal’s exclusive property and may transfer them to its parent company, affiliates, subsidiaries and any company of the L’Oréal Group or any third-party.\n• The use or publication of my Image and Material, identification and attributes for the purpose described above will be free of charge and will not entitle me to receive any financial compensation whatsoever from L’Oréal.\n• I shall not use or publish any photos and/or videos related to L’Oréal without L’Oréal’s prior approval.\n• I will maintain strictly confidential the content, purpose and implementation of this Release as well as all information, of any nature whatsoever, obtained as a result of its implementation.\n• No stipulation in this Release shall be interpreted as creating a partnership between L’Oréal and myself.\n• I acknowledge and agree that this Release will be processed by L’Oréal who will therefore have access to my personal data.\n• I release L’Oréal, its representative, employees, members, parent companies, subsidiaries, and affiliates, from all claims and demands arising out of or in connection with the use of my Image and the Material.",
  },
  {
    body: "I expressly and irrevocably acknowledge and agree that I will not receive any financial compensation whatsoever from L’Oréal in return for the use of my Image and the Material and I hereby waive all claims in relation with the usage of my Image made in accordance with the terms contained herein.",
  },
] as const;

const arabicTerms = [
  {
    body: "أقرّ وأوافق على أنه سيتم التقاط صور لي، سواء كانت صورًا فوتوغرافية أو تسجيلات فيديو. ولأغراض هذا الإقرار، يُقصد بمصطلح “الصورة” كافة عناصر وسمات التعريف الخاصة بي، بما في ذلك — على سبيل المثال لا الحصر — صورتي، واسمي الأول، واسم العائلة، وصوتي، وتوقيعي، وهيئتي، وملامحي وصفاتي الشخصية.",
  },
  {
    body: "أوافق على تفويض شركة لوريال وشركتها الأم، وشركاتها التابعة، والشركات الشقيقة، وبوجه عام شركات مجموعة لوريال، باستخدام صورتي ونسخها وإعادة إنتاجها وتعديلها وعرضها، كليًا أو جزئيًا، لأغراض التسويق والإعلان، سواء عبر الإنترنت أو خارجه، وعلى أي وسيلة أو وسيط كان، وبأي صيغة كانت، سواء للاستخدام الداخلي أو الخارجي أو في الفعاليات العامة أو غير ذلك، وبوجه عام لغرض الإعلان والترويج لشركة لوريال، وذلك دون أي قيد أو حد فيما يتعلق بعدد مرات النسخ أو العرض أو التعديل أو الاقتباس.",
  },
  {
    body: "يقتصر هذا الاستخدام من قبل لوريال على الصورة التي تم جمعها، وأي مواد أخرى ملموسة أو غير ملموسة تم إنتاجها في إطار الفعالية (ويُشار إليها مجتمعة بـ “المواد”)، والتي قد تقترن أو ترتبط بأي من العلامات التجارية أو العلامات المميزة الخاصة بشركة لوريال.",
  },
  {
    body: "يتضمن هذا الإقرار حق شركة لوريال في إجراء أي تعديل أو إضافة أو حذف أو قص أو معالجة أو أي تغيير آخر تراه مناسبًا على صورتي الأصلية و/أو المواد، ويُمنح هذا الحق دون أي قيد أو حد فيما يتعلق بعدد مرات النسخ أو العرض أو التعديل أو التكييف.",
  },
  {
    body: "تُمنح حقوق الاستخدام المشار إليها أعلاه لشركة لوريال وشركتها الأم وشركاتها التابعة والشركات الشقيقة، وبوجه عام لشركات مجموعة لوريال، دون مقابل، وعلى نطاق عالمي، ولمدة غير محدودة، ودون أن يترتب على ذلك أي مسؤولية قانونية على شركة لوريال بأي شكل من الأشكال فيما يتعلق بأي نشر و/أو استخدام لصورتي.",
  },
  {
    body: "أقرّ وأوافق صراحة على ما يلي:\n• تظل المواد وحقوق الملكية الفكرية المتعلقة بالمواد ملكية حصرية لشركة لوريال، ويحق لها نقلها أو التنازل عنها إلى شركتها الأم، أو الشركات التابعة لها، أو الشركات الزميلة، أو أي شركة من شركات مجموعة لوريال، أو إلى أي طرف ثالث.\n• إن استخدام أو نشر صورتي والمواد وسمات ووسائل التعريف الخاصة بي للأغراض الموضحة أعلاه يتم دون مقابل، ولا يخولني الحصول على أي تعويض مالي، كليًا أو جزئيًا، من شركة لوريال أيًا كان نوعه.\n• أتعهد بعدم استخدام أو نشر أو إعادة نشر أي صور و/أو مقاطع فيديو متعلقة بشركة لوريال إلا بعد الحصول على موافقة مسبقة من شركة لوريال.\n• أتعهد بالحفاظ على السرية التامة والصارمة لمحتوى هذا الإقرار وغرضه وآلية تنفيذه، وكذلك لجميع المعلومات، أيًا كان نوعها أو طبيعتها، التي يتم الحصول عليها نتيجة لتنفيذه.\n• لا يجوز تفسير أي حكم من أحكام هذا الإقرار على أنه يُنشئ شراكة أو علاقة عمل مشترك بيني وبين شركة لوريال.\n• أقرّ وأوافق على أن هذا الإقرار سيتم معالجته من قبل شركة لوريال، وبناءً عليه سيكون لها حق الوصول إلى بياناتي الشخصية.\n• أُبرئ ذمة شركة لوريال وممثليها وموظفيها وأعضائها وشركاتها الأم والتابعة والزميلة من جميع المطالبات والدعاوى والمسؤوليات الناشئة عن أو المرتبطة باستخدام صورتي والمواد.",
  },
  {
    body: "أقرّ وأوافق صراحة وبشكل نهائي وغير قابل للرجوع على أنني لن أتقاضى أي مقابل أو تعويض مالي، أيًا كان نوعه، من شركة لوريال، وذلك نظير استخدام صورتي والمواد، وأتنازل بموجب هذا تنازلاً تامًا ونهائيًا عن أي مطالبات أو حقوق أو دعاوى قد تكون لي أو تنشأ لي فيما يتعلق باستخدام صورتي وفقًا للشروط والأحكام الواردة في هذا الإقرار.",
  },
] as const;

export const waiverContent: Record<WaiverLanguage, WaiverContent> = {
  ar: {
    language: "ar",
    htmlLang: "ar",
    dir: "rtl",
    eventLabel: "فعالية إطلاق نجوم لوريال",
    documentTitle: "إقرار وتنازل الفعالية",
    eventIntroduction:
      "يتم تنظيم فعالية إطلاق نجوم لوريال (ويُشار إليها بـ “الفعالية”) من قبل شركة لوريال المملكة العربية السعودية (“لوريال”) في المملكة العربية السعودية، استوديوهات لوكا بتاريخ 9 سبتمبر 2026، وذلك بغرض إطلاق منصة ولاء صناع المحتوى \"نجوم لوريال\" في المملكة العربية السعودية.",
    acceptanceStatement:
      "وبمشاركتي في الفعالية، أقرّ أنا الموقّع أدناه وأوافق دون أي تحفظ على الشروط والأحكام التالية:",
    signatureAcknowledgement:
      "بتوقيعي على هذا الإقرار الشخصي، أضمن أنني بكامل أهليتي لمنح الحقوق المذكورة أعلاه إلى لوريال، وأقبل بشكل نهائي لا رجعة فيه أن أكون ملزمًا قانونيًا بالشروط أعلاه.",
    dataProcessingNotice:
      "تُجمع بياناتك الشخصية وتُعالج من قبل لوريال من أجل إدارة الفعالية و/أو الفيلم أو الأفلام و/أو المرئيات التي تمنح موافقتك بشأنها.",
    privacyPolicyLabel: "سياسة الخصوصية في المملكة العربية السعودية",
    terms: arabicTerms,
    ui: {
      languageLabel: "اللغة",
      fullNameLabel: "الاسم الكامل",
      fullNamePlaceholder: "الاسم الكامل للحاضر",
      requiredReading: "قراءة مطلوبة",
      termsTitle: "الشروط والأحكام",
      openTerms: "فتح الشروط والأحكام",
      termsRead: "تمت قراءة الشروط",
      termsNotRead: "لم تتم قراءة الشروط بعد",
      consentLabel: "قرأت وأوافق على إقرار الموافقة",
      signatureTitle: "التوقيع",
      signaturePlaceholder: "وقّع هنا",
      signatureAriaLabel: "التوقيع",
      clear: "مسح",
      reset: "إعادة ضبط",
      submit: "إرسال الإقرار",
      submitting: "جارٍ الإرسال",
      nextAttendee: "الحاضر التالي",
      successMessage: "شكرًا لك، يمكنك المتابعة.",
      serverValidationMessage: "يرجى إكمال خطوات الإقرار المطلوبة.",
      submitError: "تعذر إرسال الإقرار.",
      networkError: "توجد مشكلة في الاتصال. تحقق من شبكة الجهاز وحاول مرة أخرى.",
      readTermsConfirm: "قرأت الشروط والأحكام",
      closeTerms: "إغلاق الشروط",
      moreInformation:
        "للمزيد من المعلومات حول كيفية إدارة البيانات، يرجى مراجعة الرابط التالي:",
    },
    validation: {
      fullName: "يرجى إدخال الاسم الكامل للحاضر.",
      termsRead: "يجب على الحاضر قراءة شروط الإقرار أولاً.",
      consentWaiver: "الموافقة على الإقرار مطلوبة.",
      signatureDataUrl: "التوقيع مطلوب.",
    },
    pdf: {
      headerLabel: "نجوم لوريال",
      footerLabel: "فعالية إطلاق نجوم لوريال | 9 سبتمبر 2026 | المملكة العربية السعودية",
      signedBy: "تم التوقيع بواسطة",
      handwrittenSignature: "التوقيع بخط اليد",
      documentReference: "رقم مرجع المستند",
    },
  },
  en: {
    language: "en",
    htmlLang: "en",
    dir: "ltr",
    eventLabel: "L’Oréalistar Launch Event",
    documentTitle: "Event Waiver",
    eventIntroduction:
      "The L’Oréalistar Launch Event (the “Event”) is organized by L’Oréal Saudi Arabia (“L’Oréal”) in Kingdom of Saudi Arabia, Loca Studios on 9th of September 2026 for the purpose of launching the L’Oréalistar creator loyalty platform in the Kingdom of Saudi Arabia.",
    acceptanceStatement:
      "By taking part in the Event, I, the undersigned, accept without reserve the below terms:",
    signatureAcknowledgement:
      "By signing this personal release undertaking, I warrant that I am in my full capacity in order to grant the abovementioned rights to L’Oréal and irrevocably accept to be legally bound by the above terms.",
    dataProcessingNotice:
      "Your personal data are collected and processed by L’Oréal in order to manage the Event, Film(s) and/or the Visual(s) for which you give your consent.",
    privacyPolicyLabel: "KSA Privacy Policy",
    terms: englishTerms,
    ui: {
      languageLabel: "Language",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Attendee full name",
      requiredReading: "Required reading",
      termsTitle: "Waiver terms and policy",
      openTerms: "Open Terms and Conditions",
      termsRead: "Terms read",
      termsNotRead: "Terms not read yet",
      consentLabel: "I have read and agree to the waiver consent",
      signatureTitle: "Signature",
      signaturePlaceholder: "Sign here",
      signatureAriaLabel: "Signature",
      clear: "Clear",
      reset: "Reset",
      submit: "Submit waiver",
      submitting: "Submitting",
      nextAttendee: "Next attendee",
      successMessage: "Thank you, you may proceed.",
      serverValidationMessage: "Please complete the required waiver steps.",
      submitError: "Unable to submit the waiver.",
      networkError: "Connection issue. Check the tablet network and try again.",
      readTermsConfirm: "Read terms and conditions",
      closeTerms: "Close terms",
      moreInformation:
        "For more information on how we manage data please check the following link:",
    },
    validation: {
      fullName: "Enter the attendee's full name.",
      termsRead: "The attendee must read the waiver terms first.",
      consentWaiver: "Waiver consent is required.",
      signatureDataUrl: "Signature is required.",
    },
    pdf: {
      headerLabel: "L'OREALISTAR",
      footerLabel: "L'Orealistar Launch Event | 9 September 2026 | Kingdom of Saudi Arabia",
      signedBy: "SIGNED BY",
      handwrittenSignature: "Handwritten signature",
      documentReference: "Document reference",
    },
  },
};

export const defaultWaiverLanguage: WaiverLanguage = "ar";
export const fallbackWaiverLanguage: WaiverLanguage = "en";

export function normalizeWaiverLanguage(value: unknown): WaiverLanguage {
  return value === "en" || value === "ar" ? value : defaultWaiverLanguage;
}

export function getWaiverContent(language: unknown) {
  return waiverContent[normalizeWaiverLanguage(language)];
}

export const waiverTerms = waiverContent.en.terms;
export const waiverEventIntroduction = waiverContent.en.eventIntroduction;
export const waiverAcceptanceStatement = waiverContent.en.acceptanceStatement;
export const signatureAcknowledgement = waiverContent.en.signatureAcknowledgement;
export const dataProcessingNotice = waiverContent.en.dataProcessingNotice;
