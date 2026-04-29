import { Button, Card, CardBody, Chip, Tooltip, useDisclosure } from '@heroui/react'
import { toast } from '@heroui/toast'
import {
  Plus,
  Layers,
  Archive,
  FileCheck,
  Clock,
  CheckCircle,
  Paperclip,
  Delete,
  Pencil,
  FolderSearch2,
  EyeOff,
  Eye
} from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import ListBoxWrapper from '../../document/components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'
import { hopdongAxios } from '@renderer/api/hr/contract/hopdongAxios'
import { truncateMiddle } from '@renderer/utils/string'
import OfficeIcon from '@renderer/components/OfficeIcon'
import DrawerDocument from './components/drawer/DrawerDocument'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import BoxFilter from './components/table/Filters/BoxFilter'
import { useHopdongStore } from '@renderer/store/useProfileStore'
import ModalCompose from './components/modal/ModalCompose'
import FormHopdong from './components/form/FormHopdong'
import RowActionCheckbox from './components/table/RowActionCheckbox'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import BoxSearchFile from './components/BoxSearchFile'
import { date } from '@renderer/utils/formatDate'

export default function HopdongPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const { listBox, toggleListBox } = useLayoutStore()
  const [length, setlength] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)
  const [selectedRow, setSelectedRow] = useState<string | number>('')
  const [openDetail, setOpenDetail] = useState(false)
  const [openSearchFile, setOpenSearchFile] = useState(false)
  const [indexRow, setIndexRow] = useState<number>(-1)
  const { filters } = useHopdongStore()
  const { isOpen: isOpenCompose, onClose: onCloseCompose, onOpen: onOpenCompose } = useDisclosure()
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const lengthSelectedIds = selectedIds.size
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [showLuong, setShowLuong] = useState<{ [id: string]: boolean }>({})
  const {
    isOpen: isOpenComposeEdit,
    onClose: onCloseComposeEdit,
    onOpen: onOpenComposeEdit
  } = useDisclosure()

  //handle selectedids
  const handleSelectedIds = useCallback((ids: Set<string | number>) => {
    setSelectedIds(ids)
  }, [])

  // Qu?n lý d? li?u t? form trong modal
  const [formData, setFormData] = useState<Record<string, object>>({})
  // Qu?n lý file t? form con
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const onFilesChange = (name: string, files: File[]) => {
    const oldFiles = fileGroups[name] || []
    const deletedFiles = oldFiles.filter(
      (old) => !files.some((f) => f.name === old.name && f.size === old.size)
    )

    if (deletedFiles.length > 0) {
      const deletedFileNames = deletedFiles.map((f) => f.name)

      const listFileOldName = ['files_dinh_kem_old']
      Object.keys(formData).forEach((key) => {
        if (!listFileOldName.includes(key)) return

        const value = formData[key]
        if (Array.isArray(value)) {
          const matched = value.filter((item) => deletedFileNames.includes(item.file_name))
          const notMatched = value.filter((item) => !deletedFileNames.includes(item.file_name))

          // if (matched.length > 0) {}
          if (notMatched.length > 0) {
            setFormData((p) => ({ ...p, [key]: notMatched }))
          }
        }
      })
    }

    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  const onSearchChange = (value: string): void => {
    console.log('Search value:', value)
  }

  // Preview file
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  const convertSize = (str: string) => {
    const [num, unit] = str.split(' ')
    const n = parseFloat(num)
    if (unit === 'KB') return n * 1024
    if (unit === 'MB') return n * 1024 * 1024
    return n
  }

  const guessMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'pdf':
        return 'application/pdf'
      case 'doc':
      case 'docx':
        return 'application/msword'
      case 'xlsx':
      case 'xls':
        return 'application/vnd.ms-excel'
      default:
        return 'application/octet-stream'
    }
  }

  const toggleShowLuong = (id: string) => {
    setShowLuong((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Tùy ch?nh columns
  const customColumns = filters.tableColumn.map((col) => {
    switch (col.uid) {
      case 'ten_nguoi_tao':
        return {
          ...col,
          className: 'w-22 hidden lg:table-cell',
          render: (value, row) => {
            return (
              <div className="text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap w-30">
                {value} ---
                <div>
                  <small>{row.email_nguoi_tao}</small>
                </div>
              </div>
            )
          }
        }

      case 'so_hop_dong':
        return {
          ...col,
          render: (value, row) => (
            <div className="flex justify-between gap-2 items-center p-0.5 pr-3 w-10">
              <div className="flex flex-col grow">
                <span className="mb-1 whitespace-nowrap">{value}</span>
                {row.files_hop_dong?.length > 0 && (
                  <span className="text-gray-500">
                    {row.files_hop_dong.map((f, index) => (
                      <Chip
                        key={f.ten_file_goc + index}
                        size="sm"
                        className="text-xs bg-transparent border-1 border-gray-300 p-1 mr-1 mb-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(f.duong_dan, f.ten_file_goc)
                        }}
                      >
                        <div className="flex gap-2">
                          <OfficeIcon name={f.ten_file_goc} size={14} />
                          <span className="text-gray-600">{truncateMiddle(f.ten_file_goc)}</span>
                        </div>
                      </Chip>
                    ))}
                  </span>
                )}
              </div>
            </div>
          )
        }

      case 'dang_hieu_luc':
        return {
          ...col,
          className: 'w-22 hidden lg:table-cell',
          render: (value) => {
            const isActive = Number(value) === 1

            return (
              <div
                className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
            ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            w-30
          `}
              >
                <span
                  className={`
              w-2 h-2 rounded-full 
              ${isActive ? 'bg-green-500' : 'bg-red-500'}
            `}
                ></span>

                {isActive ? 'Có hi?u l?c' : 'H?t hi?u l?c'}
              </div>
            )
          }
        }

      case 'ho_va_ten':
        return {
          ...col,
          className: 'w-50 hidden lg:table-cell',
          render: (value, row) => {
            // console.log('value: ', value)
            return (
              <div className="flex justify-between gap-2 items-center p-0.5 pr-3 w-10">
                <div className="flex flex-col grow">
                  <div className="text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap w-30">
                    {value}
                    <div>
                      <small className="whitespace-nowrap">{row.ten_don_vi}</small>
                    </div>
                  </div>
                </div>
                <span>
                  <ActionRowDocument
                    data={row}
                    onDelete={handleDelete}
                    onOpenComposeEdit={async () => {
                      const id = row['id_hop_dong'] as string | number
                      const res = await hopdongAxios.show(id)
                      if (res.status == 200) {
                        const data = res.data || {}
                        setFormData({
                          ...data,
                          files_hop_dong: JSON.parse(data.files_hop_dong),
                          files_dinh_kem_old: JSON.parse(data.files_hop_dong)
                        })

                        // console.log('files_hop_dong: ', JSON.parse(data.files_hop_dong))

                        const existingFiles = JSON.parse(data.files_hop_dong).map((f) => ({
                          // id: Number(f.id_file_dinh_kem), không có id
                          id: Number(f.file_path),
                          name: f.file_name,
                          size: convertSize(f.file_size),
                          url: f.file_path, // ho?c API cung c?p URL decode
                          type: guessMimeType(f.file_name)
                        }))

                        setExistingFiles(existingFiles)
                      }

                      setEditingId(id)
                      onOpenComposeEdit()
                    }}
                  />
                </span>
              </div>
            )
          }
        }

      case 'luong_co_ban':
        return {
          ...col,
          className: 'w-24 hidden lg:table-cell',
          render: (value, row) => {
            const show = showLuong[row.id] ?? false

            const formatted = Number(value).toLocaleString('vi-VN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })

            return (
              <div className="flex items-center gap-2 text-zinc-600 w-28">
                {/* <span className="truncate">{show ? formatted : '**********'}</span> */}
                <span className="truncate">{formatted}</span>

                <button
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    // toggleShowLuong(row.id_hop_dong)
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )
          }
        }

      case 'ngay_bat_dau':
        return {
          ...col,
          className: 'w-30 hidden lg:table-cell',
          render: (value) => {
            if (!value) return ''

            const date = new Date(value)
            const formatted = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })

            return <div className="text-zinc-600 w-24 whitespace-nowrap">{formatted}</div>
          }
        }

      case 'ngay_ket_thuc':
        return {
          ...col,
          className: 'w-30 hidden lg:table-cell',
          render: (value) => {
            if (!value) return ''

            const date = new Date(value)
            const formatted = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })

            return <div className="text-zinc-600 w-24 whitespace-nowrap">{formatted}</div>
          }
        }

      default:
        return col
    }
  })

  const onClickRow = async (row: object): Promise<void> => {
    setOpenDetail(true)
    setSelectedRow(row['id_van_ban'] as string | number)
  }

  const {
    data: hopdongData = [],
    isLoading: isLoadingHopdong,
    isFetching: isFetchingHopdong,
    refetch: hopdongRefetch
  } = useQuery({
    queryKey: ['hopdong', filters, length],
    queryFn: () => {
      const customDataApi = {
        searchValue: filters.searchValue || '',
        searchKey: JSON.stringify({
          searchValue: filters.searchValue,
          selectedClassify: filters.selectedClassify || 'all',
          so_hop_dong: 'so_hop_dong' in filters ? filters.so_hop_dong : '',
          loai_hop_dong: 'loai_hop_dong' in filters ? filters.loai_hop_dong : '',
          ngay_ky_tu: 'ngay_ky_tu' in filters ? filters.ngay_ky_tu : '',
          ngay_ky_den: 'ngay_ky_den' in filters ? filters.ngay_ky_den : '',
          ngay_ket_thuc_tu: 'ngay_ket_thuc_tu' in filters ? filters.ngay_ket_thuc_tu : '',
          ngay_ket_thuc_den: 'ngay_ket_thuc_den' in filters ? filters.ngay_ket_thuc_den : ''
        }),
        fromDate: filters.dateRange.fromDate,
        toDate: filters.dateRange.toDate
      }

      return hopdongAxios.fetch(customDataApi).then((response) => {
        setTotalRecord(response.recordsTotal || 0)
        setTotalRecordFiltered(response.recordsFiltered || 0)
        return response.data || []
      })
    }
  })

  // useQuery chi ti?t van b?n
  const {
    data: detailData,
    isLoading: detailIsLoading,
    isFetching: detailIsFetching
    // refetch: detailRefetch
  } = useQuery({
    queryKey: ['detail', selectedRow],
    queryFn: async () => {
      return hopdongAxios.show(selectedRow!).then((response) => response.data || null)
    },
    enabled: !!selectedRow // Ch? ch?y khi có selectedRow và click trái
  })

  // X? lý khi indexRow thay d?i - c?p nh?t selectedRow
  useEffect(() => {
    if (indexRow >= 0 && hopdongData && hopdongData[indexRow]) {
      const row = hopdongData[indexRow]
      const id = row['id_van_ban'] as string | number
      setSelectedRow(id)
      setOpenDetail(true)
    }
  }, [indexRow, hopdongData])

  const handleDelete = async (ids: (string | number) | (string | number)[]) => {
    const payload = Array.isArray(ids) ? ids : [ids]
    await hopdongAxios.delete({ ids: payload }).then((response) => {
      if (response.status === 200) {
        hopdongRefetch().then(() => {
          if (response.success) {
            toast({
              title: response.message || 'Xóa van b?n thành công',
              color: 'success'
            })
          } else {
            toast({
              title: response.message || 'Xóa van b?n th?t b?i',
              color: 'danger'
            })
          }
        })
      }
    })
  }

  // menu action khi có ch?n nhi?u checkbox
  const menuActionCheckboxs = () => [
    {
      label: 'Xóa',
      icon: <Delete size={15} />,
      onClick: () => {
        handleDelete([...selectedIds])
        setSelectedIds(new Set())
      }
    }
  ]

  // File list
  const [searchFile, setSearchFile] = useState('')
  const [filterFile, setFilterFile] = useState<{
    fileType: string
    author: string
    date: { start: string; end: string } | null
  }>({ fileType: '', author: '', date: null })
  const {
    data: dataFiles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['files', openSearchFile, searchFile, filterFile],
    enabled: !!openSearchFile,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      hopdongAxios
        .files({
          page: pageParam,
          limit: 20,
          search: searchFile,
          fileType: filterFile.fileType,
          author: filterFile.author,
          date: filterFile.date
        })
        .then((res) => {
          const files = Array.isArray(res.data) ? res.data : res.data?.data || []
          return files
        }),
    getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length + 1 : undefined)
  })

  const allFiles = dataFiles?.pages.flat() || []

  useEffect(() => {
    const timeout = setTimeout(() => {
      refetch()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchFile, filterFile])

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="">
          <div className="block xl:hidden">
            <Button
              isIconOnly
              startContent={<Plus />}
              color="primary"
              radius="full"
              onPress={toggleListBox}
              className="fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
            ></Button>
          </div>
          <div
            className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 z-2 ${listBox ? 'block' : 'hidden'}`}
            onClick={toggleListBox}
          ></div>
          <ListBoxWrapper open={listBox} onOpenCompose={onOpenCompose} />
        </div>
        <div className="flex-1 space-y-3">
          <TableDocument
            title="Danh sách van b?n"
            primaryKey="id_hop_dong"
            FiltersComponent={<PopupFilter />}
            FilterBoxComponent={<BoxFilter />}
            SearchFile={
              <InputSearchFile
                openSearchFile={openSearchFile}
                setOpenSearchFile={setOpenSearchFile}
              />
            }
            RowActionComponent={
              lengthSelectedIds > 0 ? (
                <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
              ) : undefined
            }
            columns={customColumns}
            initVisibleColumns={filters.initial_visible_columns}
            page={filters.page}
            totalRecordFiltered={totalRecordFiltered}
            data={hopdongData as Record<string, unknown>[]}
            onPageChange={() => {}}
            length={length}
            setlength={setlength}
            totalRecord={totalRecord}
            onSearchChange={onSearchChange}
            onClickRow={onClickRow}
            selectedRow={selectedRow}
            isLoading={isLoadingHopdong || isFetchingHopdong}
            handleSelectedIds={handleSelectedIds}
            selectedIds={selectedIds}
            indexRow={indexRow}
            setIndexRow={setIndexRow}
          />
        </div>
        {openSearchFile && (
          <div className="lg:max-w-xs">
            <BoxSearchFile
              data={allFiles}
              onLoadMore={fetchNextPage}
              hasMore={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              setSearchFile={setSearchFile}
              searchFile={searchFile}
              setFilterFile={setFilterFile}
              filterFile={filterFile}
            />
          </div>
        )}
      </div>
      <DrawerDocument
        open={openDetail}
        isLoading={detailIsLoading || detailIsFetching}
        onClose={() => setOpenDetail(false)}
        data={detailData}
        indexRow={indexRow}
        setIndexRow={setIndexRow}
      />
      <ModalCompose
        title="Thêm h?p d?ng"
        isOpenCompose={isOpenCompose}
        onClose={onCloseCompose}
        size="5xl"
        fileGroups={fileGroups}
        handleSubmitApi={(_id, data) => hopdongAxios.create(data!)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['hopdong']
          })
          setFormData({})
        }}
        formData={formData}
      >
        <FormHopdong formData={formData} setFormData={setFormData} onFilesChange={onFilesChange} />
      </ModalCompose>

      <ModalCompose
        title="S?a h?p d?ng"
        isOpenCompose={isOpenComposeEdit}
        onClose={() => {
          onCloseComposeEdit()
          setFormData({})
          setFileGroups({})
        }}
        size="5xl"
        fileGroups={fileGroups}
        handleSubmitApi={(_id, data) => hopdongAxios.update(String(editingId), data!)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['hopdong']
          })
          setFormData({})
        }}
        formData={formData}
      >
        <FormHopdong
          formData={formData}
          setFormData={setFormData}
          onFilesChange={onFilesChange}
          existingFiles={existingFiles}
        />
      </ModalCompose>
    </div>
  )
}

function ActionRowDocument({
  data,
  onOpenComposeEdit = () => {}
  // onDelete
}: {
  data: Record<string, unknown>
  onDelete?: (id: string | number) => void
  onOpenComposeEdit?: () => void
}): React.JSX.Element {
  if (!data) return <></>
  // const id = data.id_van_ban as string | number

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
        <Tooltip content="S?a" className="capitalize bg-slate-100" radius="none">
          <Button
            isIconOnly
            radius="full"
            size="sm"
            variant="light"
            onPress={() => {
              onOpenComposeEdit()
            }}
          >
            <Pencil size={14} />
          </Button>
        </Tooltip>
      </div>
      {/* {(JSON.parse(data.files_hop_dong as string)).length > 0 && <Paperclip className="size-3 text-slate-400" />} */}
      {/* <span className="text-slate-400 text-[10px] truncate">
        {date('vi', data.ngay_ky as string)}
      </span> */}
    </div>
  )
}

function InputSearchFile({
  openSearchFile,
  setOpenSearchFile
}: {
  openSearchFile: boolean
  setOpenSearchFile: (value: boolean) => void
}) {
  return (
    <Button isIconOnly variant="light" onPress={() => setOpenSearchFile(!openSearchFile)}>
      <FolderSearch2 className={!openSearchFile ? 'text-gray-600' : 'text-blue-400'} />
    </Button>
  )
}
