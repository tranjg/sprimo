import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import axios from "axios"

const LoginForm = () => {

    const formSchema = z.object({
        email: z.string().email({message: "Invalid email address"}),
        username: z.string().min(2, {message: "Must be 2 or more characters long"}).max(50, {message: "Must be 50 or fewer characters long"}),
        password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })})

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    })
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
          const res = await axios.post('http://localhost:3000/api/auth/sign-up', values)
          
          if (res.data) {

          }

        } catch (error:any) {
          console.error('Form submission error', error)
          if (error.response && error.response.data) {
            // Display the server-side error message (e.g., user exists)
            const errorMessage = error.response.data.message || 'Failed to submit the form. Please try again.';
            toast.error(errorMessage);
          } else {
            // Generic error handling if no specific message is found
            toast.error('Failed to submit the form. Please try again.');
          }
        }
      }

    return(
        <Card className="mx-auto max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">


                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button type="submit" className="w-full">
                  Log in
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
}

export default LoginForm

