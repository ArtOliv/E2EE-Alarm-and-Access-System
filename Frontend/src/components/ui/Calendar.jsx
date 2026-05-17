import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { cn } from "../../lib/utils"

export function Calendar({ className, selected, onSelect, ...props }) {
  return (
    <div className={cn("text-foreground relative p-2", className)}>
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        locale={ptBR}
        classNames={{
          month_caption: "flex justify-center items-center h-8 mb-4",
          caption_label: "text-sm font-medium capitalize",
          nav: "absolute top-2 left-0 w-full flex justify-between items-center px-3 z-10 pointer-events-none",
          button_previous: "pointer-events-auto rdp-button_previous",
          button_next: "pointer-events-auto rdp-button_next",
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday: "text-muted-foreground font-medium text-[0.8rem] uppercase w-9 text-center pb-2",
          week: "flex w-full mt-1",
          day: "flex-1 flex justify-center",
          day_button: "rdp-day_button",
        }}
        {...props}
      />
    </div>
  )
}