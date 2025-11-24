import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import * as Yup from 'yup';

type RootStackParamList = {
    Usuario: { nomeUsuario: string }; 
    Login: undefined; 
};

//validação com Yup
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('O nome de usuário é obrigatório'),
  password: Yup.string()
    .required('A senha é obrigatória')
});

type LoginFormValues = {
  name: string;
  password: string;
};

export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async (values: LoginFormValues) =>{
    const SERVER_URL = 'http://localhost:3001'; 
    
    try {
        const res = await fetch(`${SERVER_URL}/users?username=${values.name}&password=${values.password}`);
        const users = await res.json();
        
        if (users.length > 0) {
            const user = users[0];
            alert(`Bem-vindo, ${user.username}!`);
            
            navigation.navigate('Usuario', { nomeUsuario: user.username }); 
        } else {
            alert('Nome de usuário ou senha incorretos.');
        }
    } catch (error) {
        console.error('Erro de comunicação:', error);
        alert('Erro de conexão com o servidor. Verifique se o JSON Server está ativo em localhost:3001.');
    }
  };

  return (
    <LinearGradient
          colors={['#5e2bff', '#fc6dab']}
          style={styles.container}
        >
      <Text style={styles.title}>Vamos fazer o login?</Text>

      <Formik
        initialValues={{name: '', password: ''}}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
          <>
          <TextInput style={styles.input} placeholder="Nome do usuário" onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name}/>
          {touched.name && errors.name &&(
            <Text style={styles.textoErro}>{errors.name}</Text>
          )}

          <TextInput style={styles.input} placeholder="Senha" onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} secureTextEntry/>
          {touched.password && errors.password &&(
            <Text style={styles.textoErro}>{errors.password}</Text>
          )}

          <Pressable style={styles.button} onPress={() => handleSubmit()}>
           <Text style={styles.buttonText}>Login</Text>
          </Pressable>
          </>
        )}
      </Formik>
    </LinearGradient>
  );
}

const styles= StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#145",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    width: 200, 
    height: 40,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10, 
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#145",
  },
  textoErro: {
    color: '#145',
    marginBottom: 10,
    marginLeft: 5,
  }
})