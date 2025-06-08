import {createStackNavigator} from "@react-navigation/stack"
import Login from "../screens/Login"
import Register from "../screens/Register"
import Admin from "../router_admin/Admin"
import Customer from "./Customer"
import ForgotPassword from "../screens/ForgotPassword"
import Transaction from "../screens/Transaction"

const Stack = createStackNavigator()

const Router = () =>{
    return(
        <Stack.Navigator
            initialRouteName="Customer"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Customer" component={Customer}/>
            <Stack.Screen name="Login" component={Login}/>
            
            <Stack.Screen name="Admin" component={Admin}/>
            <Stack.Screen name="Register" component={Register}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
        </Stack.Navigator>
    )
}

export default Router;