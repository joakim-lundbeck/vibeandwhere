export default function UserAgreementPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">User Agreement & Privacy Policy</h1>
      <p className="mb-4">
        By using When & Where, you agree to the following:
      </p>
      <ol className="list-decimal pl-6 mb-4 space-y-2">
        <li>
          <strong>Data Collection:</strong> We collect and store personal information such as your name, email address, and event details to facilitate event planning and invitations.
        </li>
        <li>
          <strong>Purpose:</strong> Your data is used solely for managing events, sending invitations, and tracking responses.
        </li>
        <li>
          <strong>Data Sharing:</strong> Your information may be shared with event organizers and other invitees for the purpose of event coordination. We do not sell your data to third parties.
        </li>
        <li>
          <strong>User Rights:</strong> You may request access to, correction, or deletion of your personal data at any time by contacting us.
        </li>
        <li>
          <strong>Security:</strong> We implement reasonable security measures to protect your data.
        </li>
        <li>
          <strong>Contact:</strong> For questions or requests regarding your data, contact us at <a href="mailto:support@whenandwhere.com" className="underline text-blue-600">support@whenandwhere.com</a>.
        </li>
      </ol>
      <p>
        By using this application and checking the agreement box, you acknowledge that you have read and agree to this User Agreement and Privacy Policy.
      </p>
    </div>
  );
} 