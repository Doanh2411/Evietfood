import { createStackNavigator } from "@react-navigation/stack";
import Cart from "../screens/Cart";
import IdentifyCart from "../screens/IdentifyCart";
const Stack = createStackNavigator();

const RouterCart = ({ navigation }) => {

    
    return (
        //đây là router của customer
        //thanh ở trên đầu của cus
        <Stack.Navigator
            initialRouteName="Cart"
        >
            <Stack.Screen
          name="Cart"
          component={Cart}
          options={{
            headerShown: false
          }}

          
        />
            
            <Stack.Screen 
            name="IdentifyCart" 
            component={IdentifyCart} 
            options={{
                title: 'Xác nhận thông tin'
            }}
            />
        </Stack.Navigator>
    )
}

export default RouterCart;
