import LoginForm from "./components/LoginForm"

const Login = () => {
    return(
        <div className="flex justify-center items-center w-screen h-screen border-1">
            <div className="flex justify-center items-center w-full h-full">
                <LoginForm />
            </div>
        </div>
    )
}

export default Login