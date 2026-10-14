import LegalLayout from "@/components/landing/legalLayout/LegalLayout";
import LegalList from "@/components/landing/legalList/LegalList";
import LegalSection from "@/components/landing/legalSection/LegalSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "How Kanbanchik collects, uses, and protects your data.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            updated="September 23, 2026"
            intro={[
                'This Privacy Policy explains how Serhii Kharchenko, an independent individual developer ("I", "me", "my", or the "Data Controller"), processes personal data when you use Kanbanchik (the "Application" or the "Service").',
                "Kanbanchik is an open-source, free-to-use web application. It is operated by an individual developer and is not operated by a company or other legal entity.",
                "By using the Application, you acknowledge the practices described in this Privacy Policy.",
            ]}
        >
            <LegalSection id="data-controller" title="1. Data Controller">
                <p>
                    The Data Controller responsible for the processing of
                    personal data is:
                </p>
                <p>
                    <span className="font-medium text-foreground">
                        Full name:
                    </span>{" "}
                    Serhii Kharchenko <br />
                    <span className="font-medium text-foreground">
                        Email:
                    </span>{" "}
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                </p>
                <p>
                    For privacy-related questions, requests, or to exercise your
                    data protection rights, you may contact me using the email
                    address above.
                </p>
            </LegalSection>
            <LegalSection
                id="what-personal-data-we-collect"
                title="2. What Personal Data We Collect"
            >
                <p>
                    The Application collects only the personal data reasonably
                    necessary to provide the Service, maintain account security,
                    and communicate important service-related information.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    2.1. Account Information
                </h3>
                <p>
                    When you create an account directly through the Application,
                    I may collect:
                </p>
                <LegalList
                    items={[
                        "Email address",
                        "First name",
                        "Last name",
                        "Authentication credentials necessary to access your account",
                    ]}
                />
                <p>
                    Authentication credentials are protected using appropriate
                    security measures and are not stored as plain-text
                    passwords.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    2.2. Google Sign-In Information
                </h3>
                <p>
                    If you choose to register or sign in using Google, the
                    Application may receive and store information provided by
                    Google for authentication and account creation, including:
                </p>
                <LegalList
                    items={[
                        "Email address",
                        "First name",
                        "Last name",
                        "Profile picture / avatar",
                    ]}
                />
                <p>
                    Google processes information in accordance with its own
                    privacy policies and terms.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    2.3. Session and Security Information
                </h3>
                <p>
                    When you sign in, the Application may process information
                    associated with your user session, including:
                </p>
                <LegalList
                    items={[
                        "IP address",
                        "Operating system",
                        "Web browser",
                        "Device information",
                        "Session-related information",
                    ]}
                />
                <p>
                    This information may also be included in security
                    notifications sent to your email address, such as
                    notifications informing you about a new sign-in or account
                    session.
                </p>
                <p>This information is used to:</p>
                <LegalList
                    items={[
                        "Maintain authenticated sessions",
                        "Protect accounts and the Service against unauthorized access",
                        "Detect and investigate suspicious activity",
                        "Provide users with information about their account sessions",
                        "Maintain the security and reliability of the Application",
                    ]}
                />
                <p>
                    The Application does{" "}
                    <span className="font-medium text-foreground">not</span>{" "}
                    collect precise real-time location information from your
                    device.
                </p>
            </LegalSection>
            <LegalSection
                id="how-we-use-personal-data"
                title="3. How We Use Personal Data"
            >
                <p>Personal data may be used for the following purposes:</p>
                <LegalList
                    items={[
                        "Creating and managing your account",
                        "Providing access to the Application and its features",
                        "Authenticating users",
                        "Maintaining and managing active sessions",
                        "Protecting accounts and the Application from unauthorized access, fraud, abuse, and security threats",
                        "Sending transactional and security-related email messages",
                        "Processing password resets and account recovery requests",
                        "Sending project invitations and other messages initiated by users or required to operate the Service",
                        "Communicating important information concerning the Service",
                        "Complying with applicable legal obligations",
                    ]}
                />
                <p>
                    I do{" "}
                    <span className="font-medium text-foreground">not</span> use
                    your personal data for targeted advertising, behavioral
                    advertising, or marketing purposes.
                </p>
            </LegalSection>
            <LegalSection
                id="transactional-and-service-emails"
                title="4. Transactional and Service Emails"
            >
                <p>
                    The Application may send emails necessary for the operation
                    and security of your account.
                </p>
                <p>These emails may include:</p>
                <LegalList
                    items={[
                        "Account registration or verification messages",
                        "Login or new-session notifications",
                        "Password reset and account recovery messages",
                        "Project invitations",
                        "Security notifications",
                        "Important service-related announcements",
                    ]}
                />
                <p>
                    These communications are transactional or operational in
                    nature and are{" "}
                    <span className="font-medium text-foreground">
                        not marketing communications
                    </span>
                    .
                </p>
                <p>
                    I do{" "}
                    <span className="font-medium text-foreground">not</span> use
                    your email address to send advertisements, promotional
                    campaigns, newsletters, or other marketing communications.
                </p>
            </LegalSection>
            <LegalSection
                id="analytics-advertising-and-tracking"
                title="5. Analytics, Advertising and Tracking"
            >
                <p>
                    The Application does not use advertising networks or
                    advertising technologies.
                </p>
                <p>
                    The Application does not use services such as Google
                    Analytics, Meta Pixel, or similar third-party analytics
                    services for tracking user behavior.
                </p>
                <p>
                    I do not intentionally collect personal data for
                    advertising, marketing, cross-site behavioral tracking, or
                    targeted advertising.
                </p>
                <p>
                    The Application may nevertheless be hosted or operated using
                    third-party infrastructure providers. Such providers may
                    independently process technical information, such as IP
                    addresses, network requests, logs, or device information, as
                    necessary to provide hosting, security, reliability, and
                    infrastructure services.
                </p>
                <p>
                    For example, if the Application is hosted using Vercel,
                    Vercel may process technical information associated with
                    requests to websites hosted through its infrastructure in
                    accordance with its own privacy documentation.
                </p>
            </LegalSection>
            <LegalSection
                id="cookies-and-similar-technologies"
                title="6. Cookies and Similar Technologies"
            >
                <p>
                    The Application may use strictly necessary cookies or
                    similar technologies where they are required for:
                </p>
                <LegalList
                    items={[
                        "Authentication",
                        "Maintaining user sessions",
                        "Security",
                        "Protecting the Application from abuse",
                        "Maintaining essential functionality",
                    ]}
                />
                <p>
                    The Application does not intentionally use advertising
                    cookies or analytics cookies for behavioral tracking.
                </p>
                <p>
                    Where consent is legally required for a non-essential cookie
                    or technology, such technology will not be used without the
                    required consent.
                </p>
            </LegalSection>
            <LegalSection
                id="legal-bases-for-processing-under-the-gdpr"
                title="7. Legal Bases for Processing Under the GDPR"
            >
                <p>
                    Where the General Data Protection Regulation
                    (&quot;GDPR&quot;) applies, personal data may be processed
                    on one or more of the following legal bases:
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    7.1. Performance of a Contract
                </h3>
                <p>
                    Processing may be necessary to create and maintain your
                    account, authenticate you, provide the Application, manage
                    sessions, process password resets, send project invitations,
                    and provide other features that you request.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    7.2. Legitimate Interests
                </h3>
                <p>
                    Processing may be necessary for legitimate interests,
                    including:
                </p>
                <LegalList
                    items={[
                        "Protecting accounts and the Service",
                        "Preventing fraud, abuse, and unauthorized access",
                        "Maintaining information and network security",
                        "Diagnosing technical problems",
                        "Maintaining the reliability and functionality of the Application",
                    ]}
                />
                <p>
                    When relying on legitimate interests, I will take into
                    account your rights and freedoms and will not use legitimate
                    interests as a basis where your interests or fundamental
                    rights override those interests.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    7.3. Legal Obligations
                </h3>
                <p>
                    Personal data may be processed when necessary to comply with
                    applicable laws, legal proceedings, lawful requests from
                    public authorities, or other legal obligations.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    7.4. Consent
                </h3>
                <p>
                    Where processing legally requires consent and another lawful
                    basis does not apply, I will request consent before
                    processing the relevant personal data.
                </p>
                <p>
                    You may withdraw consent at any time where processing is
                    based on consent. Withdrawal does not affect the lawfulness
                    of processing carried out before withdrawal.
                </p>
            </LegalSection>
            <LegalSection
                id="third-party-service-providers"
                title="8. Third-Party Service Providers"
            >
                <p>
                    The Application may rely on carefully selected third-party
                    providers that process personal data on my behalf or as part
                    of providing their own services.
                </p>
                <p>These may include:</p>
                <h3 className="text-lg font-medium text-foreground">
                    8.1. Google
                </h3>
                <p>
                    Google may provide identity and profile information when you
                    choose to sign in using Google.
                </p>
                <p>
                    Google&apos;s processing is subject to Google&apos;s own
                    privacy policy.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    8.2. Hosting and Infrastructure Providers
                </h3>
                <p>
                    The Application may use hosting, server, database, storage,
                    security, or infrastructure providers.
                </p>
                <p>
                    For example, the Application may be hosted using Vercel.
                    Such providers may process technical information required to
                    deliver and secure the Application.
                </p>
                <h3 className="text-lg font-medium text-foreground">
                    8.3. Email Delivery Provider
                </h3>
                <p>
                    The Application may use Gmail to deliver transactional and
                    security-related emails.
                </p>
                <p>
                    The email provider may process information such as your
                    email address and information necessary to deliver messages.
                </p>
                <p>
                    Only information reasonably necessary to provide the
                    relevant service should be shared with these providers.
                </p>
                <p>
                    Third-party providers may use personal data only according
                    to their applicable terms, privacy policies, contracts, and
                    legal obligations.
                </p>
            </LegalSection>
            <LegalSection
                id="disclosure-of-personal-data"
                title="9. Disclosure of Personal Data"
            >
                <p>I do not sell your personal data.</p>
                <p>
                    I do not share your personal data with third parties for
                    targeted advertising or marketing purposes.
                </p>
                <p>
                    Personal data may be disclosed to third parties only where
                    reasonably necessary to:
                </p>
                <LegalList
                    items={[
                        "Provide the Application",
                        "Provide hosting, infrastructure, authentication, email delivery, security, or other essential services",
                        "Protect the security and integrity of the Application",
                        "Comply with applicable law",
                        "Respond to lawful requests from public authorities",
                        "Establish, exercise, or defend legal claims",
                        "Investigate suspected fraud, abuse, or security incidents",
                    ]}
                />
                <p>
                    Where third-party processors process personal data on my
                    behalf and applicable law requires a data processing
                    agreement, appropriate contractual arrangements will be
                    used.
                </p>
            </LegalSection>
            <LegalSection
                id="open-source-software"
                title="10. Open-Source Software"
            >
                <p>
                    The Application is open-source and parts of its source code
                    may be publicly available.
                </p>
                <p>
                    The fact that the Application is open-source does not mean
                    that user accounts, personal data, session information,
                    databases, passwords, or other private user information are
                    made publicly available.
                </p>
                <p>
                    Personal data processed by the running Service is kept
                    separate from publicly available source code, except for
                    information that a user intentionally publishes through the
                    Application.
                </p>
            </LegalSection>
            <LegalSection id="data-retention" title="11. Data Retention">
                <p>
                    I retain personal data only for as long as reasonably
                    necessary for the purposes described in this Privacy Policy.
                </p>
                <p>Generally:</p>
                <LegalList
                    items={[
                        "Account information is retained while your account remains active",
                        "Session and security information is retained only for as long as reasonably necessary to maintain sessions, protect accounts, investigate security incidents, and maintain the security of the Service",
                        "Transactional email information may be retained for as long as reasonably necessary to deliver, document, or investigate service-related communications",
                        "Information may be retained for longer where this is required by law, necessary to establish or defend legal claims, or necessary for legitimate security purposes",
                        "Backup copies may remain for a limited period after deletion until they are automatically overwritten or securely deleted according to the backup lifecycle",
                    ]}
                />
                <p>
                    When personal data is no longer necessary for these
                    purposes, it will be deleted or anonymized where reasonably
                    possible.
                </p>
            </LegalSection>
            <LegalSection
                id="international-data-transfers"
                title="12. International Data Transfers"
            >
                <p>
                    Some service providers used by the Application may process
                    personal data outside the European Economic Area
                    (&quot;EEA&quot;), the United Kingdom, or your country of
                    residence.
                </p>
                <p>
                    Where GDPR or other applicable data protection law requires
                    safeguards for international transfers, appropriate legal
                    mechanisms may be used, including:
                </p>
                <LegalList
                    items={[
                        "An applicable adequacy decision",
                        'Standard Contractual Clauses ("SCCs")',
                        "Other legally recognized transfer mechanisms or safeguards",
                    ]}
                />
                <p>
                    The purpose of such safeguards is to ensure that personal
                    data remains protected when transferred internationally.
                </p>
            </LegalSection>
            <LegalSection id="data-security" title="13. Data Security">
                <p>
                    I take reasonable technical and organizational measures
                    designed to protect personal data against unauthorized
                    access, alteration, disclosure, destruction, loss, or
                    misuse.
                </p>
                <p>
                    Security measures may include authentication controls,
                    access restrictions, encrypted connections, secure session
                    management, password hashing, and other appropriate
                    technical and organizational safeguards.
                </p>
                <p>
                    However, no method of storing, transmitting, or processing
                    information over the Internet can be guaranteed to be
                    completely secure.
                </p>
            </LegalSection>
            <LegalSection id="data-breach" title="14. Data Breach">
                <p>
                    In the event of a personal data breach, I will take
                    appropriate steps to investigate, contain, mitigate, and
                    remediate the incident.
                </p>
                <p>
                    Where required by applicable law, affected supervisory
                    authorities and users will be notified within the legally
                    applicable timeframe.
                </p>
                <p>
                    Where GDPR applies, a breach that is likely to result in a
                    risk to individuals&apos; rights and freedoms will be
                    reported to the competent supervisory authority without
                    undue delay and, where required, within 72 hours of becoming
                    aware of it. Where a breach is likely to result in a high
                    risk to individuals&apos; rights and freedoms, affected
                    individuals will also be informed without undue delay where
                    required by law.
                </p>
            </LegalSection>
            <LegalSection
                id="automated-decision-making-and-profiling"
                title="15. Automated Decision-Making and Profiling"
            >
                <p>
                    The Application does not use personal data to make decisions
                    based solely on automated processing that produce legal
                    effects or similarly significant effects on users.
                </p>
                <p>
                    The Application does not perform behavioral profiling for
                    advertising or marketing purposes.
                </p>
            </LegalSection>
            <LegalSection
                id="children's-privacy"
                title="16. Children's Privacy"
            >
                <p>
                    The Application is intended for users who are{" "}
                    <span className="font-medium text-foreground">
                        18 years of age or older
                    </span>
                    .
                </p>
                <p>
                    I do not knowingly provide accounts to individuals under 18
                    years of age.
                </p>
                <p>
                    If I become aware that an account has been created by a
                    person under 18, I may take reasonable steps to delete the
                    account and associated personal data, subject to applicable
                    legal requirements.
                </p>
                <p>
                    If you believe that a person under 18 has provided personal
                    data to the Application, please contact me at{" "}
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                    .
                </p>
            </LegalSection>
            <LegalSection
                id="your-rights-under-the-gdpr"
                title="17. Your Rights Under the GDPR"
            >
                <p>Where GDPR applies, you may have the following rights:</p>
                <LegalList
                    items={[
                        "**Right of access** - to request information about the personal data I process about you and obtain a copy of that data",
                        "**Right to rectification** - to request correction of inaccurate or incomplete personal data",
                        "**Right to erasure** - to request deletion of your personal data where the applicable legal conditions are met",
                        "**Right to restriction of processing** - to request that processing of your personal data be restricted in certain circumstances",
                        "**Right to data portability** - to receive certain personal data in a structured, commonly used, and machine-readable format and, where legally applicable, request its transfer to another controller.",
                        "**Right to object** - to object to certain processing based on legitimate interests or other applicable legal grounds.",
                        "**Right to withdraw consent** - where processing is based on your consent, you may withdraw that consent at any time.",
                        "**Rights regarding automated decision-making** - where applicable law provides such rights in relation to solely automated decisions producing legal or similarly significant effects.",
                    ]}
                />
                <p>
                    To exercise your rights, contact me at{" "}
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                    .
                </p>
                <p>
                    I may need to verify your identity before fulfilling a
                    request in order to protect your account and prevent
                    unauthorized disclosure of personal information.
                </p>
                <p>
                    Where GDPR applies, requests will generally be handled
                    without undue delay and within the time period required by
                    applicable law.
                </p>
                <p>
                    You may also lodge a complaint with the data protection
                    supervisory authority in the country where you live, work,
                    or believe that a violation of data protection law occurred.
                </p>
            </LegalSection>
            <LegalSection
                id="united-states-privacy-rights"
                title="18. United States Privacy Rights"
            >
                <p>
                    Depending on your state of residence and whether the
                    relevant state privacy law applies to this Service, you may
                    have additional privacy rights under United States state
                    privacy laws.
                </p>
                <p>These may include rights to:</p>
                <LegalList
                    items={[
                        "Know or access the categories and specific pieces of personal information collected",
                        "Request deletion of personal information",
                        "Request correction of inaccurate personal information",
                        "Opt out of the sale or sharing of personal information where applicable",
                        "Limit certain uses or disclosures of sensitive personal information where applicable",
                        "Receive equal treatment for exercising applicable privacy rights",
                    ]}
                />
                <p>
                    The Application does{" "}
                    <span className="font-medium text-foreground">not</span>{" "}
                    sell personal information and does not share personal
                    information for cross-context behavioral advertising.
                </p>
                <p>
                    If applicable law grants you one of these rights, you may
                    exercise it by contacting{" "}
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                    .
                </p>
                <p>
                    For California residents, rights under the California
                    Consumer Privacy Act (&quot;CCPA&quot;) and California
                    Privacy Rights Act (&quot;CPRA&quot;) apply only to the
                    extent that the Service is subject to those laws and their
                    applicable thresholds and exemptions.
                </p>
                <p>
                    Because this Service is a free, individually operated
                    open-source project and does not sell personal information
                    or use personal information for behavioral advertising,
                    certain CCPA/CPRA obligations may not apply to the Service.
                </p>
            </LegalSection>
            <LegalSection
                id="no-payment-or-advertising-services"
                title="19. No Payment or Advertising Services"
            >
                <p>The Application is provided free of charge.</p>
                <p>The Application:</p>
                <LegalList
                    items={[
                        "Does not require users to pay for access",
                        "Does not process payments",
                        "Does not use payment processors",
                        "Does not sell products or subscriptions through the Service",
                        "Does not display advertising",
                        "Does not use personal data for advertising or marketing purposes",
                    ]}
                />
            </LegalSection>
            <LegalSection
                id="changes-to-this-privacy-policy"
                title="20. Changes to This Privacy Policy"
            >
                <p>
                    I may update this Privacy Policy from time to time to
                    reflect changes to the Application, the data processing
                    practices, or applicable legal requirements.
                </p>
                <p>
                    The updated version will be published on this page with a
                    new &quot;Last updated&quot; date.
                </p>
                <p>
                    Where required by applicable law, I will provide additional
                    notice or obtain consent before material changes take
                    effect.
                </p>
            </LegalSection>
            <LegalSection id="contact" title="21. Contact">
                <p>
                    If you have any questions about this Privacy Policy, your
                    personal data, or the processing of your information, please
                    contact:
                </p>
                <p>
                    <span className="font-medium text-foreground">
                        Full name:
                    </span>{" "}
                    Serhii Kharchenko <br />
                    <span className="font-medium text-foreground">
                        Email:
                    </span>{" "}
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                </p>
                <p>
                    You may also use this email address to request access,
                    correction, deletion, restriction of processing, data
                    portability, or other applicable privacy rights.
                </p>
                <p>
                    <span className="font-medium text-foreground">
                        Effective date: September 23, 2026
                    </span>
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
