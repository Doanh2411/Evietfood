import { createStackNavigator } from "@react-navigation/stack";
import ChangePassword from "../screens/ChangePassword";
import ProfileCustomer from "../screens/ProfileCustomer";

const Stack = createStackNavigator();

const RouterProfile = ({ navigation }) => {

    
    return (
        //đây là router của customer
        //thanh ở trên đầu của cus
        <Stack.Navigator
            initialRouteName="ProfileCustomer"
        >
            <Stack.Screen 
            name="ProfileCustomer" 
            component={ProfileCustomer} 
            options={{
                title: "Hồ sơ khách hàng",
                headerLeft: null,
                headerShown: false,
                headerStyle: { backgroundColor: 'orange' }, // Changed background color to orange
                headerTitleStyle: { 
                    
                    fontSize: 25, // Increased font size to 30
                    fontWeight: 'bold' // Made the font bold
                },}}
            />
            <Stack.Screen 
            name="ChangePassword" 
            component={ChangePassword} 
            options={{
                title: "Đổi mật khẩu",
                headerStyle: { backgroundColor: 'orange' },
                headerTitleStyle: { 
                    color: 'black', // Changed title color to white
                    fontSize: 25, // Increased font size to 30
                    fontWeight: 'bold' // Made the font bold
                },
                
            }}
            />
        </Stack.Navigator>
    )
}

export default RouterProfile;
