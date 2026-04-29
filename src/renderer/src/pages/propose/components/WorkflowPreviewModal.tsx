import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { SignerTag } from "./SignerTag";
import { User, Building2, ArrowDown } from "lucide-react";

interface WorkflowPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: any[];
  user: any;
}

export default function WorkflowPreviewModal({ isOpen, onClose, sequence, user }: WorkflowPreviewModalProps) {
  // Combine all steps including Step 1 (Người soạn)
  const allSteps = [
    {
      thu_tu_trinh_ky: 1,
      ten_don_vi: "Người soạn",
      specificSigners: [user],
      isCreator: true
    },
    ...sequence.filter(s => !s.isMissing)
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      size="md"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "border-none shadow-2xl",
        header: "border-b border-gray-100 dark:border-gray-800 pb-3",
        footer: "border-t border-gray-100 dark:border-gray-800 pt-3",
        wrapper: "z-[10000]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                Xem trước quy trình ký
              </span>
              <p className="text-xs font-normal text-gray-400 normal-case">
                Kiểm tra lại thứ tự và người ký trước khi gửi đề xuất
              </p>
            </ModalHeader>
            <ModalBody className="py-6 px-4">
              <div className="flex flex-col gap-0 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-gray-100 dark:from-blue-600 dark:via-blue-800 dark:to-gray-800" />
                
                {allSteps.map((step, index) => {
                  const isLast = index === allSteps.length - 1;
                  
                  return (
                    <div key={index} className="relative pl-12 pb-8 last:pb-2 group">
                      {/* Step Indicator */}
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 
                        ${step.isCreator 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' 
                          : 'bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md'}
                      `}>
                        {step.isCreator ? <User size={20} /> : <span className="text-sm font-bold">{step.thu_tu_trinh_ky}</span>}
                      </div>

                      {/* Content Card */}
                      <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-900/40">
                         <div className="flex items-center gap-2 mb-2">
                             <Building2 size={14} className="text-gray-400" />
                             <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                {step.ten_don_vi}
                             </span>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                            {step.selectedUnits ? (
                                // Case for multiple units in one level
                                step.selectedUnits.map((unit: any, uIdx: number) => (
                                    <div key={uIdx} className="w-full flex flex-col gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
                                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 italic">
                                            {unit.name}
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(unit.specificSigners || []).map((signer: any, sIdx: number) => (
                                                <SignerTag key={sIdx} signer={signer} isViewOnly />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Case for single unit or creator
                                (step.specificSigners || step.lanh_dao_don_vi || []).map((signer: any, sIdx: number) => (
                                    <SignerTag key={sIdx} signer={signer} isViewOnly />
                                ))
                            )}
                         </div>
                      </div>
                      
                      {!isLast && (
                          <div className="absolute left-[19px] bottom-0 -mb-4 z-20 text-blue-300">
                             <ArrowDown size={14} />
                          </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="flat" onPress={onClose} className="font-semibold px-8" radius="full">
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
