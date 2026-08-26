import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/stores/useAuthstore";
import { useNavigate } from "react-router";

const signinFormSchema = z.object({

    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SigninFormValues = z.infer<typeof signinFormSchema>

export function SigninForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const signIn = useAuthStore((state) => state.signIn)
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SigninFormValues>({
        resolver: zodResolver(signinFormSchema)
    });
    const onSubmit = async (data: SigninFormValues) => {
        const { username, password } = data;
        await signIn(username, password);
        navigate("/");
    };
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border-border">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            {/* header - logo */}
                            <div className=" flex flex-col items-center text-center gap-2">
                                <a href="/" className="mx-auto block w-fit text-center">
                                    <img src="/logo.svg" alt="logo" />
                                </a>

                                <h1 className="text-2xl font-bold">Đăng nhập</h1>
                                <p className="text-muted-foreground text-balance text-center">
                                    Nhập thông tin của bạn để đăng nhập vào tài khoản
                                </p>
                            </div>

                            {/* username */}
                            <div className="flex flex-col gap-3">
                                <label htmlFor="username" className="block text-sm">Tên đăng nhập</label>
                                <Input type="text" id="username" {...register("username")} placeholder="username" />
                                {errors.username && (
                                    <p className="text-sm text-destructive text-sm">{errors.username.message}</p>
                                )}
                            </div>



                            {/* mat khau */}
                            <div className="flex flex-col gap-3">
                                <label htmlFor="password" className="block text-sm">Mật khẩu</label>
                                <Input type="password" id="password" {...register("password")} placeholder="password" />
                                {errors.password && (
                                    <p className="text-sm text-destructive text-sm">{errors.password.message}</p>
                                )}
                            </div>

                            {/* nut dang nhap */}
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                                </Button>
                                <div className="text-center text-sm">
                                    Bạn chưa có tài khoản? <Link to="/signup" className="underline underline-offset-4 hover:text-primary">Đăng ký ngay</Link>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="/group.png"
                            alt="Image"
                            className="absolute top-1/2 -translate-y-1/2 object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="px-6 text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
                Bằng việc tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
                và <a href="#">Chính sách bảo mật</a> của chúng tôi.
            </div>

        </div>
    )
}