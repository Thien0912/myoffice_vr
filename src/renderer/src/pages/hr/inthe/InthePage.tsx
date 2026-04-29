import { motion } from 'framer-motion'
import React, { useMemo } from 'react'

import { useInthe } from './hooks/useInthe'
import { useIntheColumns } from './hooks/useIntheColumns'
import IntheToolbar from './components/IntheToolbar'
import IntheTable from './components/IntheTable'
import IntheCardDesign from './components/IntheCardDesign'
import { DrawerCustom, DrawerHeaderCustom, DrawerContentCustom } from '@renderer/components/DrawerCustom'

export default function InthePage() {
  const {
    searchValue,
    setSearchValue,
    idDonvi,
    setIdDonvi,
    page,
    setPage,
    limit,
    setLimit,
    selectedKeys,
    setSelectedKeys,
    donviOptions,
    personnel,
    total,
    filtered,
    isLoading,
    handleClearFilters,
    columnWidths,
    setColumnWidth,
    sortDescriptors,
    setSortDescriptors,
    pinnedColumns,
    setPinnedColumn,
    activeEmployee,
    setActiveEmployee
  } = useInthe()

  const columns = useIntheColumns(page, limit, setActiveEmployee)

  const selectedCount = useMemo(() => {
    if (selectedKeys === 'all') return personnel.length
    return (selectedKeys as Set<React.Key>).size
  }, [selectedKeys, personnel])

  const hasSelection = selectedCount > 0

  return (
    <div
      className="flex flex-col gap-2 flex-1 min-h-0 h-[calc(100dvh-130px)]"
    >
      <div className="sticky top-0 z-30 backdrop-blur-sm pt-2 pb-1">
        <IntheToolbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        idDonvi={idDonvi}
        setIdDonvi={setIdDonvi}
        donviOptions={donviOptions}
        isLoading={isLoading}
        hasSelection={hasSelection}
        selectedCount={selectedCount}
        onClearFilters={handleClearFilters}
        setPage={setPage}
      />

      </div>

      <div className="flex-1 overflow-hidden flex flex-row relative gap-2 min-h-0">
        <IntheTable
          columns={columns}
          data={personnel}
          isLoading={isLoading}
          total={total}
          filtered={filtered}
          page={page}
          limit={limit}
          selectedKeys={selectedKeys}
          pinnedColumns={pinnedColumns}
          columnWidths={columnWidths}
          onColumnResize={setColumnWidth}
          sortDescriptors={sortDescriptors}
          onSortChange={setSortDescriptors}
          onPinColumn={setPinnedColumn}
          onSelectionChange={setSelectedKeys}
          onPageChange={setPage}
          onLimitChange={(val) => {
            setLimit(val)
            setPage(1)
          }}
        />

        <DrawerCustom
          open={!!activeEmployee}
          onClose={() => setActiveEmployee(null)}
          title="Thiết kế thẻ"
          width={window.innerWidth >= 1280 ? 1200 : window.innerWidth >= 768 ? 800 : window.innerWidth}
        >
          {activeEmployee && (
            <div className="h-full flex flex-col bg-white dark:bg-gray-800">
               <DrawerHeaderCustom 
                  title="Thiết lập thẻ"
                  onClose={() => setActiveEmployee(null)}
               />

               <DrawerContentCustom className="p-0 overflow-hidden h-full">
                  <IntheCardDesign employee={activeEmployee} />
               </DrawerContentCustom>
            </div>
          )}
        </DrawerCustom>
      </div>
    </div>
  )
}
