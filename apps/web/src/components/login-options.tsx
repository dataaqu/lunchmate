"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendMagicLink, signInWithGoogle } from "@/app/login/actions";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "შეიყვანეთ ელფოსტა" })
    .email({ message: "არასწორი ელფოსტის ფორმატი" }),
});

type EmailValues = z.infer<typeof emailSchema>;

function GoogleSubmit() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      Google-ით შესვლა
    </Button>
  );
}

export function LoginOptions({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: EmailValues) {
    const result = await sendMagicLink(email);
    if (result.ok) {
      toast.success("შესვლის ბმული გამოგზავნილია", {
        description: `შეამოწმეთ ${email} — გამოგზავნეთ ბმული შესასვლელად.`,
      });
      form.reset();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={signInWithGoogle}>
        <GoogleSubmit />
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>ან</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ელფოსტა</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="animate-spin" />
            )}
            ბმულის მიღება ელფოსტით
          </Button>
        </form>
      </Form>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458a5.52 5.52 0 0 1-2.394 3.622v3.01h3.878c2.269-2.09 3.578-5.165 3.578-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.956-1.075 7.942-2.908l-3.878-3.01c-1.075.72-2.45 1.145-4.064 1.145-3.125 0-5.77-2.11-6.714-4.948H1.276v3.108A11.996 11.996 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.286 14.279A7.213 7.213 0 0 1 4.91 12c0-.79.136-1.557.376-2.279V6.613H1.276A11.996 11.996 0 0 0 0 12c0 1.936.464 3.769 1.276 5.387l4.01-3.108z"
      />
      <path
        fill="#EA4335"
        d="M12 4.773c1.762 0 3.345.606 4.59 1.795l3.442-3.442C17.952 1.19 15.236 0 12 0A11.996 11.996 0 0 0 1.276 6.613l4.01 3.108C6.23 6.882 8.875 4.773 12 4.773z"
      />
    </svg>
  );
}
