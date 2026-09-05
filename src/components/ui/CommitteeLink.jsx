import React from 'react';
import { Link } from 'react-router-dom';

// Shared committee-page link for motion and meeting info bars — same label,
// href shape, and tooltip on both, so they can't drift apart independently.
export default function CommitteeLink({ committee, slug }) {
  return (
    <Link to={`/committees/${slug}`} className="text-[#004a99] hover:underline" title={`View ${committee} committee page`}>
      {committee}
    </Link>
  );
}
