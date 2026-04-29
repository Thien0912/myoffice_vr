import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { X } from 'lucide-react'

interface SignerTagProps {
  signer: any
  onRemove?: () => void
  isViewOnly?: boolean
}

export const SignerTag = ({ signer, onRemove, isViewOnly }: SignerTagProps) => {
  return (
    <div className="flex items-center gap-1 group bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all hover:border-blue-300 max-w-[180px]">
      <UserAvatarVertical
        name={signer.ql_nguoi_dung_ho_ten || signer.ho_va_ten || signer.name}
        src={signer.ql_nguoi_dung_avatar || signer.avatar || signer.hinh_anh || signer.ql_nguoi_dung_hinh_anh}
        size="sm"
        className="flex-1 min-w-0 bg-transparent hover:bg-transparent px-0 py-0"
      />
      {!isViewOnly && onRemove && (
        <button 
          className="p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-blue-300 hover:text-red-500 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
