import { Button, Checkbox, cn } from '@heroui-v3/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { Trash2 } from 'lucide-react'
import { DayRow } from '../hooks/useCreateLeaveRequest'

import { Controller, useFormContext } from 'react-hook-form'

interface LeaveDaysFormProps {
    days: DayRow[]
    onRemoveDay: (index: number) => void
    isReadOnly?: boolean
}

export const LeaveDaysForm = ({ days, onRemoveDay, isReadOnly = false }: LeaveDaysFormProps) => {
    const { control } = useFormContext()

    return (
        <div className="flex flex-col gap-1.5">
            {days.map((day, index) => (
                <div
                    key={day.id}
                    className="flex items-center gap-3 w-full"
                >
                    {/* Date input */}
                    <div className="flex-1 min-w-0">
                        <Controller
                            name={`days.${index}.date`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <DateInputFloatingLabel
                                    value={field.value}
                                    onChange={field.onChange}
                                    isRequired
                                    radius="xl"
                                    isDisabled={isReadOnly}
                                />
                            )}
                        />
                    </div>

                    {/* Session checkboxes */}
                    <div className="flex items-center justify-center gap-2 px-3 h-[42px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl shrink-0">
                        <Controller
                            name={`days.${index}.sang`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    isSelected={field.value}
                                    onChange={field.onChange}
                                    isDisabled={isReadOnly}
                                    className="flex items-center gap-1.5 cursor-pointer m-0"
                                >
                                    <Checkbox.Control className="size-3.5 rounded-lg before:rounded-lg">
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <Checkbox.Content>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sáng</span>
                                    </Checkbox.Content>
                                </Checkbox>
                            )}
                        />
                        <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0"></div>
                        <Controller
                            name={`days.${index}.chieu`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    isSelected={field.value}
                                    onChange={field.onChange}
                                    isDisabled={isReadOnly}
                                    className="flex items-center gap-1.5 cursor-pointer m-0"
                                >
                                    <Checkbox.Control className="size-3.5 rounded-lg before:rounded-lg">
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <Checkbox.Content>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Chiều</span>
                                    </Checkbox.Content>
                                </Checkbox>
                            )}
                        />
                    </div>

                    {/* Delete button */}
                    {!isReadOnly && (
                        <Button
                            size="sm"
                            isIconOnly
                            variant="ghost"
                            onPress={() => onRemoveDay(index)}
                            isDisabled={days.length === 1}
                            className={cn(
                                'h-8 w-8 min-w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0',
                                days.length === 1 && 'opacity-0 pointer-events-none'
                            )}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    )
}
