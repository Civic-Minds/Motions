import React from 'react';
import { Link } from 'react-router-dom';
import { ElectionSummaryCard } from '../ui/CivicCard';
import { formatElectionDateFull } from '../../utils/electionDate';

// Every city's election page shows the same two tiles once voting has
// closed — there's nothing city-specific left to say at that point, so this
// is shared rather than duplicated per city.
export default function ElectionResultCards({ electionDate }) {
  return (
    <>
      <ElectionSummaryCard pill="Result" pillClass="bg-blue-50 text-[#004a99]" footer={<Link to="/councillors" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">See council →</Link>}>
        <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Voting closed {formatElectionDateFull(electionDate)}.</p>
      </ElectionSummaryCard>
      <ElectionSummaryCard pill="What’s next" footer={<Link to="/" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">Browse motions →</Link>}>
        <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Follow how the new council votes on Motions.</p>
      </ElectionSummaryCard>
    </>
  );
}
