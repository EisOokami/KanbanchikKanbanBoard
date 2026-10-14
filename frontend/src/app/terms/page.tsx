import LegalLayout from "@/components/landing/legalLayout/LegalLayout";
import LegalList from "@/components/landing/legalList/LegalList";
import LegalSection from "@/components/landing/legalSection/LegalSection";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "The terms that govern use of Kanbanchik.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <LegalLayout
            title="Terms & Conditions"
            updated="September 23, 2026"
            intro={[
                'These Terms & Conditions ("Terms") govern your access to and use of Kanbanchik, a web-based Kanban and project management application, together with related services made available through it (collectively, the "Service").',
                'The Service is operated by an individual independent developer ("I", "me", "my" or the "Service Provider"), and not by a company or other incorporated business entity.',
                <>
                    <span className="font-medium text-foreground">
                        Service Provider:
                    </span>
                    <br />
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
                </>,
                "By creating an account or using the Service, you confirm that you have read, understood, and agreed to these Terms.",
            ]}
        >
            <LegalSection id="eligibility" title="1. Eligibility">
                <p>
                    You must be at least{" "}
                    <span className="font-medium text-foreground">
                        18 years old
                    </span>{" "}
                    to create an account or use the Service.
                </p>
                <p>
                    By using the Service, you represent that you are at least 18
                    years old and legally capable of entering into these Terms.
                </p>
                <p>
                    The Service is not intended for persons under 18 years of
                    age, and I do not knowingly permit persons under 18 to
                    create or maintain accounts.
                </p>
            </LegalSection>
            <LegalSection
                id="description-of-the-service"
                title="2. Description of the Service"
            >
                <p>
                    The Service provides online project and task management
                    functionality, including Kanban boards and related
                    collaboration features.
                </p>
                <p>
                    Depending on the features available at any given time, the
                    Service may allow you to:
                </p>
                <LegalList
                    items={[
                        "Create an account",
                        "Create and manage projects, boards, tasks, comments and other project-related information",
                        "Upload or create User Content, including text, images, documents, audio, video and other supported files",
                        "Collaborate with other users",
                        "Authenticate using an existing Google account",
                    ]}
                />
                <p>
                    The exact functionality of the Service may change over time.
                </p>
            </LegalSection>
            <LegalSection
                id="free-service-and-no-payments"
                title="3. Free Service and No Payments"
            >
                <p>
                    The Service is currently provided{" "}
                    <span className="font-medium text-foreground">
                        completely free of charge
                    </span>
                    .
                </p>
                <p>The Service does not currently provide:</p>
                <LegalList
                    items={[
                        "Paid subscriptions",
                        "Paid plans",
                        "In-app purchases",
                        "Payment processing",
                        "Paid products or services",
                        "Billing functionality",
                        "Advertising placements",
                        "Paid access to features",
                    ]}
                />
                <p>
                    You are not required to pay me for access to or use of the
                    Service.
                </p>
                <p>
                    I do not currently operate the Service as a paid
                    subscription or e-commerce platform.
                </p>
                <p>
                    The Service does not provide a marketplace through which
                    users can purchase products or services from me or from
                    other users.
                </p>
            </LegalSection>
            <LegalSection
                id="account-and-registration"
                title="4. Accounts and Registration"
            >
                <p>Certain features require you to create an account.</p>
                <p>
                    You may register directly or use Google account
                    authentication where that option is available.
                </p>
                <p>You are responsible for:</p>
                <LegalList
                    items={[
                        "Providing accurate information when creating your account",
                        "Maintaining the confidentiality of your account credentials",
                        "Protecting access to your account and devices",
                        "Notifying me if you believe that your account has been accessed without authorization",
                    ]}
                />
                <p>
                    You must not sell, transfer, rent, lease, share, or
                    otherwise provide your account to another person.
                </p>
                <p>
                    You are responsible for activity performed through your
                    account unless you can reasonably demonstrate that the
                    activity occurred without your authorization and despite
                    reasonable security measures on your part.
                </p>
            </LegalSection>
            <LegalSection id="user-content" title="5. User Content">
                <p>
                    The Service may allow you to create, upload, store,
                    transmit, share, or otherwise make available content,
                    including text, comments, images, audio, video, documents,
                    files and other materials (&quot;User Content&quot;).
                </p>
                <p>
                    You retain ownership of User Content that you lawfully own.
                </p>
                <p>
                    You are solely responsible for the User Content that you
                    submit and for ensuring that you have all rights,
                    permissions, and legal bases required to upload and use it
                    through the Service.
                </p>
                <p>
                    Depending on the functionality and configuration of the
                    Service, User Content may be accessible only to you, to
                    members of a project or workspace, or to other users with
                    whom you choose to share it.
                </p>
                <p>
                    You must not upload or submit personal data belonging to
                    another person unless you have a lawful basis and all
                    necessary permissions to do so.
                </p>
            </LegalSection>
            <LegalSection
                id="content-restrictions"
                title="6. Content Restrictions"
            >
                <p>
                    You must not use the Service to create, upload, store,
                    share, transmit, or publish User Content that:
                </p>
                <LegalList
                    type="ordered"
                    items={[
                        "Is unlawful or facilitates unlawful activity",
                        "Infringes copyright, trademark, patent, trade secret, privacy, publicity, or other rights of another person",
                        "Contains malware, ransomware, viruses, malicious scripts, or other harmful code",
                        "Is intended to compromise, disrupt, attack, overload, or gain unauthorized access to systems, accounts, networks, or infrastructure",
                        "Contains phishing, credential theft, scams, fraudulent schemes, or other deceptive activity",
                        "Contains threats, harassment, stalking, intimidation, or targeted abuse",
                        "Promotes discrimination, unlawful violence, terrorism, or other unlawful conduct",
                        "Contains sexual exploitation, sexual abuse, or other unlawful sexual material",
                        "Contains sexually explicit or pornographic material",
                        "Contains graphic or excessively violent material",
                        "Exposes, publishes, or distributes another person's private or confidential information without authorization",
                        "Impersonates another person, organization, or service in a deceptive manner",
                        "Is materially false or misleading where its publication is intended to deceive or cause harm",
                        "Constitutes spam, unsolicited commercial communication, or abusive bulk messaging",
                        "Contains advertisements or promotional material for products, services, businesses, websites, or other commercial activities without my prior written permission",
                        "Violates applicable law or regulations",
                        "Interferes with the normal operation or security of the Service",
                    ]}
                />
                <p>
                    These restrictions apply to all supported forms of User
                    Content, including comments, text, images, audio, video,
                    documents and other uploaded files.
                </p>
                <p>
                    I may remove, restrict, disable access to, or otherwise
                    moderate User Content that I reasonably believe violates
                    these Terms, applicable law, or the security and integrity
                    of the Service.
                </p>
            </LegalSection>
            <LegalSection
                id="prohibited-use-of-the-service"
                title="7. Prohibited Use of the Service"
            >
                <p>You must not:</p>
                <LegalList
                    items={[
                        "Attempt to gain unauthorized access to the Service, another user's account, or related infrastructure",
                        "Bypass authentication, access controls, rate limits, security mechanisms, or other technical restrictions",
                        "Intentionally interfere with the availability or performance of the Service",
                        "Use automated methods to abuse, overload, scrape, or excessively access the Service where such activity is not reasonably necessary for legitimate use and is not authorized by me",
                        "Distribute malware or other malicious software through the Service",
                        "Use the Service to conduct unlawful activities",
                        "Use the Service to advertise or promote products, services, businesses, websites, or other commercial offerings without my prior written permission",
                        "Sell, rent, lease, sublicense, transfer, or commercially resell access to the hosted Service",
                        "Sell or transfer your account, project membership, or other access rights",
                        "Falsely represent that you operate, own, or officially represent the Service or its branding",
                    ]}
                />
                <p>
                    Using the Service for ordinary internal business,
                    educational, personal, or project-management purposes is not
                    prohibited merely because the underlying activity is
                    commercial. The prohibition concerns using the Service
                    itself as an advertising, promotional, resale, or
                    unauthorized commercial distribution channel.
                </p>
            </LegalSection>
            <LegalSection
                id="intellectual-property"
                title="8. Intellectual Property"
            >
                <p>
                    I retain the intellectual property rights that I own in and
                    to the Service, including my original:
                </p>
                <LegalList
                    items={[
                        "Logo and branding",
                        "Trademarks and trade names",
                        "Website-specific visual identity and original design elements",
                        "Documentation and original written materials",
                        "Source code to the extent it is not subject to third-party or open-source rights",
                        "Other original materials created by me",
                    ]}
                />
                <p>
                    The Service is distributed in whole or in part as{" "}
                    <span className="font-medium text-foreground">
                        open-source software
                    </span>
                    . The use, reproduction, modification, and redistribution of
                    open-source portions of the software are governed by the
                    applicable open-source license:
                </p>
                <p>
                    <a
                        href="https://github.com/EisOokami/KanbanchikKanbanBoard/blob/main/LICENSE"
                        className="text-foreground underline underline-offset-4"
                    >
                        MIT License
                    </a>
                </p>
                <p>
                    Nothing in these Terms is intended to restrict rights that
                    are expressly granted by the applicable open-source license.
                </p>
                <p>
                    Open-source licensing of the code does not grant you
                    ownership of my trademarks, logo, branding, proprietary
                    visual assets, or other materials that are not covered by
                    that license.
                </p>
                <p>
                    Third-party software, libraries, fonts, icons, assets, and
                    other components remain subject to their respective licenses
                    and rights holders.
                </p>
                <p>
                    You must not remove, alter, or obscure copyright, trademark,
                    licensing, attribution, or other proprietary notices where
                    doing so would violate applicable law or the relevant
                    license.
                </p>
            </LegalSection>
            <LegalSection
                id="hosted-service-and-resale"
                title="9. Hosted Service and Resale"
            >
                <p>
                    The hosted version of the Service is provided by me and is
                    not offered for resale, sublicensing, white-labeling, or
                    commercial redistribution.
                </p>
                <p>
                    You may not represent the hosted Service as your own product
                    or service, sell access to it, or provide paid access to the
                    Service to third parties without my prior written
                    permission.
                </p>
                <p>
                    This section does not limit rights to use or redistribute
                    open-source code where those rights are expressly granted by
                    the applicable open-source license.
                </p>
            </LegalSection>
            <LegalSection
                id="feedback-and-suggestions"
                title="10. Feedback and Suggestions"
            >
                <p>
                    If you provide feedback, ideas, suggestions, bug reports,
                    feature requests, or other recommendations concerning the
                    Service (&quot;Feedback&quot;), you agree that I may use,
                    reproduce, modify, adapt, publish, distribute, and
                    incorporate that Feedback into the Service or my other work
                    without:
                </p>
                <LegalList
                    items={[
                        "Payment or other compensation to you",
                        "Attribution to you",
                        "Obtaining additional permission from you",
                    ]}
                />
                <p>
                    You understand that Feedback may be treated as
                    non-confidential.
                </p>
                <p>
                    You should not submit confidential information, trade
                    secrets, passwords, personal data of other people, or other
                    sensitive information as Feedback unless you intend for me
                    to receive it for the purpose for which it is submitted.
                </p>
                <p>
                    Any processing of personal data contained in Feedback is
                    governed by the Privacy Policy.
                </p>
            </LegalSection>
            <LegalSection id="privacy" title="11. Privacy">
                <p>
                    I process personal data in connection with the Service as
                    described in the{" "}
                    <span className="font-medium text-foreground">
                        Privacy Policy
                    </span>
                    .
                </p>
                <p>
                    The Privacy Policy forms part of these Terms by reference
                    and explains, among other things, what personal data may be
                    collected, why it is processed, how it is protected, and
                    what rights you may have.
                </p>
                <p>You can review the Privacy Policy here:</p>
                <p>
                    <Link
                        href="/privacy"
                        className="text-foreground underline underline-offset-4"
                    >
                        kanban.prydni.com/privacy
                    </Link>
                </p>
                <p>
                    The Service does not use User data for third-party marketing
                    purposes and does not provide User data to marketers for
                    marketing purposes.
                </p>
                <p>The Service currently does not contain advertising.</p>
            </LegalSection>
            <LegalSection
                id="third-party-services-and-authentication"
                title="12. Third-Party Services and Authentication"
            >
                <p>
                    The Service may rely on third-party services necessary to
                    operate certain features.
                </p>
                <p>
                    These services may include third-party authentication,
                    infrastructure, hosting, storage, email delivery, or other
                    technical services.
                </p>
                <p>
                    Where available, Google account authentication allows you to
                    register or sign in using your Google account.
                </p>
                <p>
                    Your use of third-party services may also be subject to the
                    relevant third party&apos;s own terms and policies.
                </p>
                <p>
                    I am not responsible for third-party services that are
                    outside my reasonable control, except where applicable law
                    provides otherwise.
                </p>
            </LegalSection>
            <LegalSection id="third-party-links" title="13. Third-Party Links">
                <p>
                    The Service may contain links to websites, services, or
                    resources operated by third parties.
                </p>
                <p>
                    These links are provided for convenience and do not mean
                    that I endorse, control, or guarantee those third-party
                    websites or services.
                </p>
                <p>
                    I am not responsible for the availability, content, privacy
                    practices, security, or terms of third-party websites.
                </p>
                <p>
                    You access third-party websites at your own risk and should
                    review their respective terms and privacy policies.
                </p>
            </LegalSection>
            <LegalSection
                id="service-availability-and-changes"
                title="14. Service Availability and Changes"
            >
                <p>
                    The Service is provided on an{" "}
                    <span className="font-medium text-foreground">
                        &quot;as available&quot;
                    </span>{" "}
                    basis.
                </p>
                <p>
                    I may modify, update, suspend, restrict, or discontinue the
                    Service or any feature of it at any time.
                </p>
                <p>I do not guarantee that:</p>
                <LegalList
                    items={[
                        "The Service will always be available",
                        "The Service will always operate without interruptions or errors",
                        "Every feature will remain available indefinitely",
                        "The Service will remain compatible with every browser, device, operating system, or third-party service",
                        "User Content will never be lost, corrupted, damaged, or temporarily inaccessible",
                    ]}
                />
                <p>
                    You are responsible for maintaining your own copies or
                    backups of important User Content where appropriate.
                </p>
                <p>
                    I may perform maintenance, security updates, infrastructure
                    changes, or other technical work that temporarily affects
                    availability.
                </p>
                <p>
                    Nothing in these Terms excludes rights you may have under
                    mandatory applicable law concerning the conformity, supply,
                    or proper functioning of digital services.
                </p>
            </LegalSection>
            <LegalSection
                id="suspension-and-termination"
                title="15. Suspension and Termination"
            >
                <p>
                    I may suspend or terminate your account or access to the
                    Service if you:
                </p>
                <LegalList
                    items={[
                        "Materially breach these Terms",
                        "Violate applicable law",
                        "Infringe the rights of another person",
                        "Abuse the Service",
                        "Create a significant security or operational risk",
                        "Use the Service for prohibited activities",
                        "Repeatedly submit prohibited or unlawful User Content",
                    ]}
                />
                <p>
                    Where reasonably appropriate, I may provide notice and an
                    opportunity to remedy a breach.
                </p>
                <p>
                    I may act immediately where necessary to protect Users, the
                    Service, third parties, or legal interests, including in
                    cases involving unlawful content, security incidents, fraud,
                    unauthorized access, or serious abuse.
                </p>
                <p>
                    You may stop using the Service and request termination of
                    your account at any time through the available account
                    functionality or by contacting me.
                </p>
                <p>
                    Termination does not affect rights or obligations that, by
                    their nature, should continue after termination, including
                    provisions concerning intellectual property, Feedback,
                    liability, indemnification, dispute resolution, and
                    governing law.
                </p>
            </LegalSection>
            <LegalSection
                id="user-to-user-disputes"
                title="16. User-to-User Disputes"
            >
                <p>
                    The Service may allow users to collaborate or communicate
                    with one another.
                </p>
                <p>
                    I am not a party to agreements, transactions, relationships,
                    or disputes between Users unless expressly stated otherwise.
                </p>
                <p>
                    Users are primarily responsible for resolving disputes
                    between themselves.
                </p>
                <p>
                    I may take reasonable moderation or account-related action
                    where a dispute involves alleged violations of these Terms,
                    applicable law, safety, security, or misuse of the Service,
                    but such action does not make me the arbitrator or legal
                    representative of either User.
                </p>
                <p>
                    Nothing in these Terms prevents a User from seeking legal
                    remedies that are available under applicable law.
                </p>
            </LegalSection>
            <LegalSection
                id="complaints-and-reports"
                title="17. Complaints and Reports"
            >
                <p>
                    You may submit complaints, reports of unlawful content,
                    intellectual-property complaints, or other concerns
                    concerning the Service by contacting:
                </p>
                <p>
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                </p>
                <p>
                    A complaint or report should provide sufficient information
                    for me to understand and assess the issue, including, where
                    relevant, the affected account, content, URL, project, or
                    other identifying information.
                </p>
                <p>
                    I will review complaints and reports within a reasonable
                    period and take appropriate action where required by law or
                    these Terms.
                </p>
                <p>
                    Where applicable, moderation decisions may be reviewed upon
                    request.
                </p>
            </LegalSection>
            <LegalSection
                id="disclaimer-of-warranties"
                title="18. Disclaimer of Warranties"
            >
                <p>
                    To the fullest extent permitted by applicable law, the
                    Service is provided without warranties except those that
                    cannot lawfully be excluded.
                </p>
                <p>
                    I do not guarantee that the Service will be uninterrupted,
                    error-free, secure at all times, or suitable for every
                    particular purpose.
                </p>
                <p>You use the Service at your own discretion and risk.</p>
                <p>
                    You are responsible for determining whether the Service is
                    appropriate for your intended use and for maintaining
                    appropriate copies of important information.
                </p>
                <p>
                    Nothing in this section excludes or limits mandatory
                    statutory rights.
                </p>
            </LegalSection>
            <LegalSection
                id="limitation-of-liability"
                title="19. Limitation of Liability"
            >
                <p>
                    To the fullest extent permitted by applicable law, I will
                    not be liable for indirect, incidental, special,
                    consequential, exemplary, or punitive damages, including
                    loss of profits, loss of business opportunity, business
                    interruption, loss of anticipated savings, or similar losses
                    arising from your use of or inability to use the Service.
                </p>
                <p>
                    To the fullest extent permitted by law, my total aggregate
                    liability arising out of or relating to the Service or these
                    Terms shall not exceed{" "}
                    <span className="font-medium text-foreground">
                        PLN 100 (one hundred Polish zloty)
                    </span>
                    .
                </p>
                <p>
                    This limitation applies regardless of the legal basis of a
                    claim, including contract, tort, negligence, or otherwise,
                    except to the extent that such limitation is prohibited by
                    mandatory law.
                </p>
                <p>
                    Nothing in these Terms excludes or limits liability that
                    cannot lawfully be excluded or limited, including liability
                    for intentional acts and other mandatory statutory
                    liability.
                </p>
                <p>
                    Nothing in these Terms limits any rights relating to the
                    protection of personal data that cannot lawfully be excluded
                    or limited under applicable data protection law.
                </p>
                <p>Nothing in these Terms limits mandatory consumer rights.</p>
            </LegalSection>
            <LegalSection id="indemnification" title="20. Indemnification">
                <p>
                    To the fullest extent permitted by law, you agree to
                    compensate me for reasonable losses, claims, liabilities,
                    and costs arising directly from:
                </p>
                <LegalList
                    type="ordered"
                    items={[
                        "Your unlawful use of the Service",
                        "Your intentional misuse of the Service",
                        "Your infringement of another person's rights",
                        "Your User Content where that User Content violates these Terms or applicable law",
                    ]}
                />
                <p>
                    This provision does not apply to losses caused by my own
                    conduct to the extent liability cannot lawfully be
                    transferred to you.
                </p>
                <p>
                    Nothing in this section limits mandatory consumer
                    protections.
                </p>
            </LegalSection>
            <LegalSection
                id="dispute-resolution"
                title="21. Dispute Resolution"
            >
                <p>
                    If you have a dispute with me arising out of or relating to
                    these Terms or the Service, the parties will first attempt
                    to resolve the dispute through{" "}
                    <span className="font-medium text-foreground">
                        good-faith informal negotiations
                    </span>
                    .
                </p>
                <p>
                    You should first contact me using the contact details
                    provided in these Terms and describe the dispute and the
                    outcome you are seeking.
                </p>
                <p>
                    If the dispute cannot be resolved through informal
                    negotiations, the parties may submit the dispute to{" "}
                    <span className="font-medium text-foreground">
                        arbitration
                    </span>
                    , where arbitration is legally permissible and the necessary
                    arbitration agreement is valid and enforceable under
                    applicable law.
                </p>
                <p>Nothing in this section:</p>
                <LegalList
                    items={[
                        "Removes mandatory rights to bring a claim before a competent court",
                        "Prevents a consumer from exercising rights granted by mandatory consumer-protection law",
                        "Excludes any mandatory jurisdiction rules",
                        "Prevents a person from seeking urgent judicial relief where legally available",
                    ]}
                />
                <p>
                    Disputes between Users remain primarily disputes between
                    those Users and are not automatically subject to arbitration
                    with me.
                </p>
            </LegalSection>
            <LegalSection id="governing-law" title="22. Governing Law">
                <p>
                    These Terms are governed by and interpreted in accordance
                    with the{" "}
                    <span className="font-medium text-foreground">
                        laws of the Republic of Poland
                    </span>
                    , without regard to conflict-of-law rules.
                </p>
                <p>
                    Where mandatory provisions of European Union law or the law
                    applicable to a User provide additional or different rights,
                    those mandatory provisions remain applicable.
                </p>
                <p>
                    Any court proceedings shall be brought before a court having
                    jurisdiction under applicable law.
                </p>
                <p>
                    For consumers, nothing in these Terms deprives them of
                    mandatory rights or jurisdiction protections granted by
                    applicable consumer-protection law.
                </p>
            </LegalSection>
            <LegalSection
                id="digital-services-act"
                title="23. Digital Services Act"
            >
                <p>
                    To the extent that the Service qualifies as an intermediary
                    service under the{" "}
                    <span className="font-medium text-foreground">
                        Digital Services Act (Regulation (EU) 2022/2065)
                    </span>
                    , I will comply with the DSA provisions that are applicable
                    to the Service and to me.
                </p>
                <p>
                    This may include obligations relating to notices concerning
                    allegedly illegal content, handling of notices, content
                    restrictions, statements of reasons, and available redress
                    mechanisms, where and to the extent required by applicable
                    law.
                </p>
                <p>
                    Any exemptions, limitations, or special rules applicable to
                    smaller providers or particular categories of intermediary
                    services will apply to the extent provided by law.
                </p>
                <p>
                    The Service is not an online marketplace and does not
                    provide functionality for Users to purchase products or
                    services through the Service.
                </p>
                <p>
                    For reports concerning potentially illegal content or other
                    DSA-related matters, contact:
                </p>
                <p>
                    <a
                        href="mailto:help.lakio@gmail.com"
                        className="text-foreground underline underline-offset-4"
                    >
                        help.lakio@gmail.com
                    </a>
                </p>
            </LegalSection>
            <LegalSection
                id="changes-to-these-terms"
                title="24. Changes to These Terms"
            >
                <p>I may update these Terms from time to time.</p>
                <p>
                    The latest version will be published on this page together
                    with its effective date.
                </p>
                <p>
                    Where appropriate, I may notify Users of material changes
                    through the Service or by email.
                </p>
                <p>
                    Your continued use of the Service after the updated Terms
                    become effective constitutes acceptance of the updated
                    Terms, to the extent permitted by applicable law.
                </p>
                <p>
                    If a change materially affects your rights and applicable
                    law gives you a right to terminate the relevant service
                    relationship, you may exercise that right in accordance with
                    the law.
                </p>
                <p>
                    Previous versions of these Terms may be retained for
                    reference.
                </p>
            </LegalSection>
            <LegalSection id="severability" title="25. Severability">
                <p>
                    If any provision of these Terms is found to be invalid,
                    unlawful, or unenforceable, that provision shall be
                    interpreted or modified to the minimum extent necessary to
                    make it valid and enforceable, where legally possible.
                </p>
                <p>
                    The remaining provisions shall remain in full force and
                    effect.
                </p>
            </LegalSection>
            <LegalSection id="entire-agreement" title="26. Entire Agreement">
                <p>
                    These Terms and the Privacy Policy constitute the agreement
                    governing your use of the Service, except where additional
                    terms are expressly provided for a particular feature.
                </p>
                <p>
                    They replace any previous version of these Terms concerning
                    the same Service, unless otherwise stated.
                </p>
            </LegalSection>
            <LegalSection
                id="prohibited-use-of-the-service"
                title="27. Contact"
            >
                <p>
                    For questions, complaints, legal notices, content reports,
                    intellectual-property concerns, or other matters concerning
                    the Service, contact:
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
                    These Terms are effective as of{" "}
                    <span className="font-medium text-foreground">
                        23 September 2026
                    </span>
                    .
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
