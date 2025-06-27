import { useNavigate } from "react-router-dom"
import LoginForm from "./components/LoginForm"
import { useEffect, useState } from "react"


const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            navigate("/dashboard")
        } else {
            setLoading(false)
        }
    }, [navigate])

    if (loading) {
        return(
            <h1>Loading...</h1>
        )
    }
    return(
        <div className="flex justify-center items-center w-screen h-screen border-1">
            <div className="flex justify-center items-center w-full h-full">
                <LoginForm />
            </div>
        </div>
    )
}


export default Login