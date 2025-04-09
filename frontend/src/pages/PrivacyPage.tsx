import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="mb-4 text-gray-300">
          At CineNiche, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="text-gray-300 mb-4">
          We collect your email and preferences when you create an account. We also collect anonymous usage data to improve your experience.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p className="text-gray-300 mb-4">
          We use your information to personalize movie recommendations, manage your account, and enhance the functionality of the platform.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Security</h2>
        <p className="text-gray-300 mb-4">
          We implement industry-standard measures to protect your data. Sensitive information like passwords is encrypted and never shared.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Sharing Your Information</h2>
        <p className="text-gray-300 mb-4">
          We do not sell or rent your personal data. We may share it with trusted third-party services strictly for operational purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="text-gray-300 mb-4">
          You may request access to or deletion of your data at any time by contacting our support team.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Updates to This Policy</h2>
        <p className="text-gray-300 mb-4">
          We may occasionally update this policy. Changes will be posted here, and significant updates will be communicated via email.
        </p>

        <p className="mt-8 text-gray-400">
          If you have any questions or concerns, please reach out to our support team.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
