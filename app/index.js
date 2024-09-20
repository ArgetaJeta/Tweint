import { useAuth } from "@/lib/authContext"
import { Redirect } from "expo-router"

export default function Root() {

   // const auth = useAuth()
   // auth.logout()

    return <Redirect href="/home" />
}
