import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import { Image, Pressable, StyleSheet, Text, TextInput } from "react-native";
import * as Yup from 'yup';


const gato = require ('@/assets/images/Gato-espiando.png');

type RootStackParamList = {
    Home: { nomeUsuario: string};
    Login: undefined; 
};

//validação com Yup
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('O nome de usuário é obrigatório'),
  password: Yup.string()
    .required('A senha é obrigatória')
}); //perfeito

type LoginFormValues = {
  name: string;
  password: string;
};

export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async (values: LoginFormValues) =>{
    const servidor = 'http://localhost:3000'; 
    
    fetch(`${servidor}/users`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Status HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then((users: any[]) => {
                const user = users.find(
                    (u) => u.username === values.name && u.password === values.password
                );

                if (user) {
                    alert(`Login bem-sucedido!`);

                    navigation.navigate('Home', { nomeUsuario: user.username });
                } else {
                    alert("Nome de usuário ou senha incorretos.");
                }
            })
            .catch((error) => {
                console.error('Erro de comunicação:', error);
                alert(`FALHA NA CONEXÃO. Verifique se o JSON Server está ativo em ${servidor}.`);
            })
  };

  return (
    <LinearGradient
          colors={['#5e2bff', '#fc6dab']}
          style={styles.container}
        >
          <Image
                    source={gato}
                    style={styles.gato}
                />
      <Text style={styles.title}>Vamos testar o login?</Text>

      <Formik
        initialValues={{name: '', password: ''}}
        validationSchema={validationSchema} //chamando o yup
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
    position: 'relative',
  },
  title: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  gato:{
    height: 200,
    width: 200,
    position: 'absolute',
    bottom: 0,

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