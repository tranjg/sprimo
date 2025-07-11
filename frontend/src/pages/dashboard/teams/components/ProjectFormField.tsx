import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const ProjectFormField = ({ name, control, label, formControl }) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className="grid gap-2">
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <FormControl>{formControl(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
