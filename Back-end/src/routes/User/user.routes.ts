import { Router } from 'express';
import * as userCtrl from './user.controller';

const router = Router();

// Agregar un nuevo usuario
router.post('/user/signup', userCtrl.signUp);

// Obtener la informacion de un usuario(Nombre Header)
router.get('/user/:id', userCtrl.getUserName);

// Editar usuario
router.put('/user/:id', userCtrl.editUser);

// Eliminar usuario
router.delete('/user/:id', userCtrl.deleteUser);

// Inicia sesión
router.post('/user/signin', userCtrl.signIn);

// Recuperar password
router.get('/user/pass/:rut', userCtrl.getPass);

//Obtener lista usuarios
router.get('/user', userCtrl.getUsers);

//Cambiar password
router.put('/user/change/pass/:id', userCtrl.changePass);

//Obtener la informacion del Usuario (Sin password)
router.get('/user/info/:id', userCtrl.getUserInfo);

export default router;
