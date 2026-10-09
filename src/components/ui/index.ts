import { type VariantProps, cva } from 'class-variance-authority'

// Button exports
export { default as Button } from './Button.vue'

// Card exports
export { default as Card } from './Card.vue'
export { default as CardHeader } from './CardHeaderContent.vue'
export { default as CardTitle } from './CardTitle.vue'
export { default as CardDescription } from './CardDescription.vue'
export { default as CardContent } from './CardContent.vue'
export { default as CardFooter } from './CardFooter.vue'

// Form exports
export { default as Input } from './Input.vue'
export { default as Label } from './Label.vue'
export { default as Textarea } from './Textarea.vue'
export { default as Checkbox } from './Checkbox.vue'
export { default as Select } from './Select.vue'
export { default as SearchableSelect } from './SearchableSelect.vue'
export { default as VueSelect } from './VueSelect.vue'
export { default as DataTable } from './DataTable.vue'

// Avatar exports
export { default as Avatar } from './Avatar.vue'
export { default as AvatarFallback } from './AvatarFallback.vue'
export { default as AvatarImage } from './AvatarImage.vue'

// Badge exports
export { default as Badge } from './Badge.vue'

// Alert exports
export { default as Alert } from './Alert.vue'
export { default as AlertTitle } from './AlertTitle.vue'
export { default as AlertDescription } from './AlertDescription.vue'

// Table exports
export { default as Table } from './Table.vue'
export { default as TableHeader } from './TableHeader.vue'
export { default as TableBody } from './TableBody.vue'
export { default as TableRow } from './TableRow.vue'
export { default as TableHead } from './TableHead.vue'
export { default as TableCell } from './TableCell.vue'
export { default as TableCaption } from './TableCaption.vue'

// Dialog exports
export { default as Dialog } from './Dialog.vue'
export { default as DialogOverlay } from './DialogOverlay.vue'
export { default as DialogContent } from './DialogContent.vue'
export { default as DialogHeader } from './DialogHeader.vue'
export { default as DialogFooter } from './DialogFooter.vue'
export { default as DialogTitle } from './DialogTitle.vue'
export { default as DialogDescription } from './DialogDescription.vue'

// Tabs exports
export { default as TabsList } from './TabsList.vue'
export { default as TabsTrigger } from './TabsTrigger.vue'
export { default as TabsContent } from './TabsContent.vue'

// Toast exports (Sonner-based)
export { default as Toaster } from './Toaster.vue'

// Additional exports
export { default as Switch } from './Switch.vue'
export { default as AccordionItem } from './AccordionItem.vue'

// Utility exports
export { default as Separator } from './Separator.vue'
export { default as Skeleton } from './Skeleton.vue'
export { default as Progress } from './Progress.vue'
export { default as Popover } from './Popover.vue'
export { default as Tooltip } from './Tooltip.vue'
export { default as DemoContainer } from './DemoContainer.vue'
export { default as DatePicker } from './DatePicker.vue'

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg transform active:scale-95",
        primary: "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-blue-800",
        info: "bg-cyan-600 text-white hover:bg-cyan-700 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-cyan-800",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-yellow-800",
        danger: "bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-red-800",
        black: "bg-black text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-gray-900",
        white: "bg-white text-black border border-gray-300 hover:bg-gray-50 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-gray-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 hover:shadow-lg transform active:scale-95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-md transform active:scale-95 hover:border-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:shadow-md transform active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 transform active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 transform active:scale-95",
        green: "bg-green-600 text-white hover:bg-green-700 hover:scale-105 hover:shadow-lg transform active:scale-95 active:bg-green-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
