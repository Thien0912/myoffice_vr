import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { Activity, EllipsisVertical, GripVertical, HelpCircle, Plus } from 'lucide-react';
import { statusOptionsByGroup } from '../../constants/recruitmentConstants';

type StatusManagementModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

const StatusManagementModal = React.memo(({ isOpen, onOpenChange }: StatusManagementModalProps) => (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" classNames={{ base: "bg-white" }}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 text-sm font-bold">
                        Quản lý trạng thái
                    </ModalHeader>
                    <ModalBody className="py-4">
                        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {statusOptionsByGroup.map(({ group, options }) => (
                                <div key={group} className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1">
                                        {group} <HelpCircle size={10} className="text-gray-300" />
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        {options.map(s => {
                                            const SIcon = s.icon || Activity;
                                            return (
                                                <div key={s.value} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group/item transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                                        <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />
                                                        <SIcon size={14} className={`${s.color || 'text-gray-400'} shrink-0`} strokeWidth={2.5} />
                                                        {s.isEditable !== false ? (
                                                            <input
                                                                defaultValue={s.label}
                                                                className="text-sm font-medium text-gray-700 bg-transparent outline-none border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded px-1.5 py-0.5 w-full transition-colors"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-500 px-1.5 py-0.5 select-none">{s.label}</span>
                                                        )}
                                                    </div>
                                                    {s.isEditable !== false && (
                                                        <Button isIconOnly variant="light" size="sm" className="opacity-0 group-hover/item:opacity-100 w-6 h-6 min-w-6 transition-opacity shrink-0">
                                                            <EllipsisVertical size={14} className="text-gray-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <Button variant="light" className="justify-start text-gray-400 text-xs font-medium h-8 px-2 border border-dashed border-gray-200 mt-1" startContent={<Plus size={14} />}>
                                            Thêm trạng thái
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter className="border-t border-gray-100">
                        <Button color="primary" onPress={onClose} className="font-medium text-sm rounded-lg bg-blue-600">
                            Đóng
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
));

StatusManagementModal.displayName = 'StatusManagementModal';

export default StatusManagementModal;
