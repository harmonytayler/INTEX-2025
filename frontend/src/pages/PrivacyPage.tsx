import React from 'react';
import { Link } from 'react-router-dom';
import '../style/account.css';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="account-container flex-grow">
        <h1 className="account-header">Privacy Policy</h1>

        <div className="privacy-content">
          <p className="mb-6">
            CineNiche values your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, and safeguard your information in accordance with the General Data Protection Regulation (GDPR), U.S. privacy laws, and the requirements of our IS414 course project.
          </p>

          <h3>1. Data Controller</h3>
          <p>
            CineNiche is the data controller responsible for your personal information. You may contact us at support@cineniche.com for any questions related to this policy or your rights.
          </p>

          <h3>2. What Data We Collect</h3>
          <p>
            When you register for an account, we collect your username, email, and a securely hashed password. We may also store data related to your account type (e.g., admin or standard user). As you interact with the site, we log your activity such as page visits, ratings, and movie preferences.
          </p>

          <h3>3. Legal Basis for Processing</h3>
          <p>
            We process your personal data based on the following lawful grounds: your consent when you accept cookies or register; the necessity of processing to fulfill a contract when you use your account; our legal obligations to protect your data; and our legitimate interest in improving and securing our services.
          </p>

          <h3>4. How We Use Your Information</h3>
          <p>
            Your data is used to authenticate you, provide personalized content such as movie recommendations, and control access based on your assigned role. We also use data to improve usability, detect unauthorized activity, and analyze how users engage with the platform.
          </p>

          <h3>5. Authentication and Role-Based Access</h3>
          <p>
            CineNiche uses ASP.NET Identity for user authentication. Passwords must meet strict security criteria. Access to sensitive areas is restricted based on user roles. Admin users may manage data such as adding or removing movies, while regular users may only interact with public content.
          </p>

          <h3>6. Data Security</h3>
          <p>
            All communication between users and the platform is secured using HTTPS. Passwords are hashed using secure cryptographic algorithms, and sensitive credentials are stored using environment variables or secret managers. We conduct periodic code reviews and implement secure development practices.
          </p>

          <h3>7. Cookies and Tracking</h3>
          <p>
            Our website uses cookies to manage login sessions and enhance your experience. A cookie consent banner is displayed to all users in compliance with GDPR. We do not use third-party analytics or tracking cookies.
          </p>

          <h3>8. User Rights</h3>
          <p>
            You have the right to request access to your personal data, request corrections, deletions, or restrictions on processing. You may withdraw consent at any time. To make a request, please contact us at support@cineniche.com.
          </p>

          <h3>9. Data Retention</h3>
          <p>
            We retain your account information and usage data for as long as your account is active or as required for academic or legal compliance. Once data is no longer needed, it is securely deleted or anonymized.
          </p>

          <h3>10. International Users</h3>
          <p>
            CineNiche is hosted in the United States. If you access our services from outside the U.S., your data may be transferred and processed in the U.S. We take appropriate safeguards to protect international user data.
          </p>

          <h3>11. Children's Privacy</h3>
          <p>
            CineNiche is not directed at individuals under the age of 13. We do not knowingly collect personal data from children. If we discover that data has been collected from a child under 13 without verified parental consent, we will delete it immediately.
          </p>

          <h3>12. Updates to This Policy</h3>
          <p>
            We may update this Privacy Policy to reflect changes to our services, legal obligations, or project structure. Any significant updates will be posted here and dated accordingly.
          </p>

          <p className="mt-8 text-gray-400">
            Last Updated: April 9, 2025<br />
            For any questions about this Privacy Policy, contact us at support@cineniche.com.
          </p>
        </div>
      </div>

      <footer className="account-footer">
        <div className="footer-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} CineNiche. All rights reserved.
          </p>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
