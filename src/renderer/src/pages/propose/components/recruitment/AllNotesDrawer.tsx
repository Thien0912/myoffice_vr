import React from 'react';
import { Image as ImageIcon, MessageCircle, UserCheck, X } from 'lucide-react';
import { HrDrawer, HrDrawerBody, HrDrawerHeader } from '../../../../components/hero-custom/HrDrawer';
import { Candidate, allCandidates } from '../../constants/recruitmentConstants';

type AllNotesDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AllNotesDrawer = React.memo(({ isOpen, onClose }: AllNotesDrawerProps) => {
    const candidatesWithNotes = React.useMemo(
        () => allCandidates.filter(c => c.notes && c.notes.length > 0),
        []
    );

    const totalNotes = React.useMemo(
        () => allCandidates.reduce((acc, c) => acc + (c.notes?.length || 0), 0),
        []
    );

    return (
        <HrDrawer
            isOpen={isOpen}
            onClose={onClose}
            placement="right"
            defaultWidth={450}
            isFloatingUI={false}
        >
            <HrDrawerHeader className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-600" strokeWidth={2.5} />
                    <h2 className="text-lg font-bold text-gray-800">
                        Tất cả ghi chú
                    </h2>
                    <span className="bg-white text-blue-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 ml-1 shadow-sm">
                        {totalNotes}
                    </span>
                </div>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <X size={20} />
                </button>
            </HrDrawerHeader>
            <HrDrawerBody className="p-5 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-5">
                {candidatesWithNotes.map((c, idx) => (
                    <CandidateNoteCard key={c.id} candidate={c} idx={idx} />
                ))}
            </HrDrawerBody>
        </HrDrawer>
    );
});

AllNotesDrawer.displayName = 'AllNotesDrawer';

// ──────────────────────────────────────────────
// Individual candidate note card
// ──────────────────────────────────────────────

const CandidateNoteCard = React.memo(({ candidate, idx }: { candidate: Candidate; idx: number }) => {
    const latestNote = candidate.notes[candidate.notes.length - 1];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md shrink-0">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="w-8 h-8 rounded-full bg-white text-gray-500 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                    <UserCheck size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-800">{candidate.fullName}</span>
                    <span className="text-gray-500 text-xs font-medium">({candidate.phone})</span>
                </div>
            </div>
            <div className="flex flex-col p-5 gap-5">
                <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-gray-800">#{candidate.mshOnline || `T26000${70 + idx}`}</span>
                    <span className="text-[11px] text-blue-600 font-bold bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                        260000{idx + 1}
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <ImageIcon size={14} />
                        <span>Ảnh hồ sơ minh chứng</span>
                    </div>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer">
                        <img src={candidate.avatar} alt="Minh chứng" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex gap-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                        {latestNote.author.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1e3a5f]">{latestNote.author}</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5">{latestNote.time}</span>
                        </div>
                        <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed mt-2 font-medium">
                            {latestNote.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CandidateNoteCard.displayName = 'CandidateNoteCard';

export default AllNotesDrawer;
