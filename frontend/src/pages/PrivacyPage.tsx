import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4 text-gray-300">
          CineNiche values your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, and safeguard your information in accordance with the General Data Protection Regulation (GDPR), U.S. privacy laws, and the requirements of our IS414 course project. By using our platform, you agree to the practices outlined below.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Data Controller</h2>
        <p className="text-gray-300 mb-4">
          CineNiche is the data controller responsible for your personal information. You may contact us at support@cineniche.com for any questions related to this policy or your rights.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. What Data We Collect</h2>
        <p className="text-gray-300 mb-4">
          When you register for an account, we collect your username, email, and a securely hashed password. We may also store data related to your account type (e.g., admin or standard user). As you interact with the site, we log your activity such as page visits, ratings, and movie preferences. Technical data such as your browser type, IP address, and operating system may be collected automatically for security and analytics purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Legal Basis for Processing</h2>
        <p className="text-gray-300 mb-4">
          We process your personal data based on the following lawful grounds: your consent when you accept cookies or register; the necessity of processing to fulfill a contract when you use your account; our legal obligations to protect your data; and our legitimate interest in improving and securing our services. We only collect and retain the data needed to provide functionality and ensure safety.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. How We Use Your Information</h2>
        <p className="text-gray-300 mb-4">
          Your data is used to authenticate you, provide personalized content such as movie recommendations, and control access based on your assigned role (e.g., only admins can create or modify content). We also use data to improve usability, detect unauthorized activity, and analyze how users engage with the platform to guide future development.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Authentication and Role-Based Access</h2>
        <p className="text-gray-300 mb-4">
          CineNiche uses ASP.NET Identity for user authentication. Passwords must meet stricter security criteria than the default configuration to prevent weak or predictable passwords. Access to sensitive areas is restricted based on user roles. Admin users may manage data such as adding or removing movies, while regular users may only interact with public content. All API endpoints that modify or retrieve user data are protected with authorization checks.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Data Security</h2>
        <p className="text-gray-300 mb-4">
          All communication between users and the platform is secured using HTTPS with a valid TLS certificate. HTTP requests are automatically redirected to HTTPS to ensure encrypted data transmission. Passwords are hashed using secure cryptographic algorithms, and sensitive credentials such as API keys are stored using environment variables or secret managers rather than in source code. We conduct periodic code reviews and implement secure development practices to minimize vulnerabilities.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Cookies and Tracking Technologies</h2>
        <p className="text-gray-300 mb-4">
          Our website uses cookies to manage login sessions and enhance your experience. A cookie consent banner is displayed to all users in compliance with GDPR. At this time, we do not use third-party analytics or tracking cookies. If we add such tools in the future, users will be given a clear choice to opt in. You may disable cookies via your browser, but doing so may limit functionality.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">8. User Rights</h2>
        <p className="text-gray-300 mb-4">
          As a user, you have the right to request access to the personal data we hold about you. You may also request corrections, deletions, or restrictions on how your data is processed. If your data is processed based on consent, you may withdraw it at any time. You also have the right to file a complaint with your data protection authority if you believe your rights are not being respected. To make a request, please contact us at support@cineniche.com.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">9. Data Retention</h2>
        <p className="text-gray-300 mb-4">
          We retain your account information and usage data for as long as your account is active or as required for academic or legal compliance. Once data is no longer needed, it is securely deleted or anonymized. You may request that your account and associated data be deleted at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">10. International Users</h2>
        <p className="text-gray-300 mb-4">
          CineNiche is hosted in the United States. If you access our services from outside the U.S., your data may be transferred and processed in the U.S. We take appropriate safeguards, such as using secure connections and minimizing data exposure, to protect international user data in compliance with applicable laws.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">11. Children’s Privacy</h2>
        <p className="text-gray-300 mb-4">
          CineNiche is not directed at individuals under the age of 13. We do not knowingly collect personal data from children. If we discover that data has been collected from a child under 13 without verified parental consent, we will delete it immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">12. Updates to This Policy</h2>
        <p className="text-gray-300 mb-4">
          We may update this Privacy Policy to reflect changes to our services, legal obligations, or project structure. Any significant updates will be posted here and dated accordingly. We encourage you to review the policy periodically to stay informed.
        </p>

        <p className="mt-8 text-gray-400">
          Last Updated: Winter 2025<br />
          For any questions about this Privacy Policy, contact us at support@cineniche.com.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
