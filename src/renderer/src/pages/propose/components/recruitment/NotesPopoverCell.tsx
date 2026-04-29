import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { MessageCircle, Send } from 'lucide-react';
import { Candidate, CandidateNote } from '../../constants/recruitmentConstants';

type NotesPopoverCellProps = {
    row: Candidate;
};

const NotesPopoverCell = React.memo(({ row }: NotesPopoverCellProps) => {
    const notes = row.notes || [];
    const displayNotes = notes.slice(0, 2);
    const remaining = notes.length - 2;

    return (
        <Popover placement="bottom" data-react-aria-top-layer="true">
            <PopoverTrigger>
                <div className="flex flex-col gap-0.5 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded-md transition-colors w-full h-full min-h-[32px] justify-center">
                    {notes.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-colors py-1">
                            <MessageCircle size={16} strokeWidth={2} />
                            <span className="text-xs font-medium">Thêm ghi chú</span>
                        </div>
                    ) : (
                        <>
                            {displayNotes.map((n: CandidateNote, idx: number) => (
                                <div key={idx} className="text-[12px] leading-[1.35] truncate text-gray-700">
                                    <span className="font-bold text-[#44556a]">{n.author}: </span>
                                    <span className="text-[#44556a]">{n.content}</span>
                                </div>
                            ))}
                            {remaining > 0 && (
                                <span className="text-[11px] font-bold text-blue-500 mt-0.5 hover:underline w-fit">+{remaining} ghi chú khác</span>
                            )}
                        </>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 overflow-hidden border border-gray-200">
                <div className="flex flex-col w-full">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-white">
                        <MessageCircle size={16} className="text-blue-500" />
                        <span className="font-semibold text-sm">Ghi chú ứng viên</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-auto">
                            {notes.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50 max-h-[300px]">
                        {notes.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm py-4">
                                Chưa có ghi chú nào
                            </div>
                        ) : (
                            notes.map((note: CandidateNote, idx: number) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 mt-0.5">
                                        {note.avatar ? (
                                            <img src={note.avatar} alt={note.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold uppercase">
                                                {note.author.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                                            <span className="text-[10px] text-gray-400">{note.time}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-white border border-gray-200 p-2.5 rounded-md rounded-tl-none whitespace-pre-wrap leading-relaxed shadow-sm">
                                            {note.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="relative flex items-end gap-2">
                            <textarea
                                placeholder="Nhập ghi chú..."
                                className="w-full text-xs border border-gray-200 rounded-md py-2.5 pl-3 pr-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all shadow-sm bg-gray-50 focus:bg-white"
                                rows={2}
                            />
                            <button className="shrink-0 p-2 h-[38px] bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md transition-colors border border-blue-100 hover:border-blue-500 flex items-center justify-center">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});

NotesPopoverCell.displayName = 'NotesPopoverCell';

export default NotesPopoverCell;
