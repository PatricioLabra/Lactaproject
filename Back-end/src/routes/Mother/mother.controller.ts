import { RequestHandler } from "express";
import Mother from './mother.model';
import { Types } from "mongoose";
import Child from '../Child/child.model';
import Control from '../Control/control.model';
import { addDataGraphic , deleteDataGraphic } from "../../libs/generate.graphics";
import { deleteControlGraphic } from "../Control/control.controller";
import { deleteChildGraphic } from "../Child/child.controller";

/**
 * Función que maneja la petición de agregar a una nueva madre al sistema.
 * @route Post /mother
 * @param req Request de la petición, se espera que tenga la información de la nueva madre
 * @param res Response, retorna un un object con success:true, data:{ _id: ObjectId() } y un message: "String" de la nueva madre si todo sale bien
 */
export const newMother: RequestHandler = async (req, res) => {
    const {
        name, rut, commune, phone_number, mail, birth, 
        ocupation, studies, marital_status, forecast,
        chronic_diseases, number_of_living_children
    } = req.body;

    //se valida si alguno de los atributos required no son válidos
    if ( !name || !rut || !commune || !phone_number || !birth || !ocupation || !studies || 
        !marital_status || !forecast || !chronic_diseases || number_of_living_children < 0)
        return res.status(400).send({ success: false, data:{}, message:'ERROR: Datos inválidos' + req.body });

    const motherFound = await Mother.findOne({ rut });

    //se valida la existencia de la madre en el sistema
    if ( motherFound )
        return res.status(301).send({ success: false, data:{}, message:'ERROR: La madre ya está registrada en el sistema.' });
    
    const newMother = {
        name, rut, commune, phone_number, mail, birth, 
        ocupation, studies, marital_status, forecast,
        chronic_diseases, number_of_living_children
    }

    //se almacena la madre en el sistema
    const motherSaved = new Mother(newMother);

    //se almacenan los datos a graficar de la madre en el sistema
    addMotherGraphic(motherSaved);

    //se almacena la madre
    await motherSaved.save();

    return res.status(201).send({ success: true, data: { _id: motherSaved._id }, message: 'Madre agregada con éxito al sistema.' });
}

/**
 * Función que maneja la petición de editar a una madre registrada en el sistema.
 * @route Put /mother
 * @param req Request de la petición, se espera que tenga la información editada de una madre existente
 * @param res Response, retorna un un object con success:true, data:{} y un message: "String" de la madre editada si todo sale bien
 */
export const editMother: RequestHandler = async (req, res) => {
    const _id = req.params.id;
    const updatedMother = req.body;

    //se valida el _id de la madre ingresada
    if ( !Types.ObjectId.isValid(_id) )
        return res.status(400).send({ success: false, data:{}, message: 'ERROR: El id ingresado no es válido.' });
    
    const motherFound = await Mother.findById( _id );

    //se valida la existencia de la madre en el sistema
    if ( !motherFound ) 
        return res.status(404).send({ success: false, data:{}, message: 'ERROR: La madre ingresada no existe en el sistema.' });

    //se eliminan los datos de la madre asociados
    deleteMotherGraphic (motherFound);

    //se actualiza la madre en el sistema
    await Mother.findByIdAndUpdate( _id, updatedMother );

    //se obtiene la madre y se agregan sus datos a la colección Graphics
    const motherFoundUpdated = await Mother.findById( _id );

    //Se actualizan los datos en la colección Graphics
    addMotherGraphic(motherFoundUpdated);

    return res.status(200).send({ success: true, data:{}, message: 'Madre editada de manera correcta.' });
}

/**
 * Función que maneja la petición de eliminar a una madre del sistema
 * @route Delete /mother/:id
 * @param req Request de la petición, se espera que tenga el id de la madre
 * @param res Response, retorna un un object con success:true, data:{ } y un message: "String" de la madre eliminada si todo sale bien
 */
 export const deleteMother: RequestHandler = async (req, res) => {
    const id_mother = req.params.id;

    //se valida el _id de la madre ingresada
    if ( !Types.ObjectId.isValid(id_mother)) 
        return res.status(400).send({ success: false, data:{}, message: 'ERROR: El id ingresado no es válido.' });
    
    const motherFound = await Mother.findById( id_mother );
    const childsFound = await Child.find( {id_mother} );
    const controlsFound = await Control.find( {id_mother} );

    //se valida la existencia de la madre en el sistema
    if ( !motherFound ) 
        return res.status(404).send({ success: false, data:{}, message: 'ERROR: La madre ingresada no existe en el sistema.' });

    if ( childsFound ){
        //se eliminan los hijos asociados a la madre desde la colección gráficos
        for ( let i = 0; i < childsFound.length ; i++ ){

            //se obtienen los controles asociados al child
            let controlsChild = await Control.find({ "id_child": childsFound[i]._id });
            
            if ( controlsChild ){
                for ( let j = 0; j < controlsChild.length; j++ ){
        
                    //se eliminan los datos del control
                    deleteControlGraphic(controlsChild[j]);
                }
            };

            //se elimina los datos del child
            deleteChildGraphic(childsFound[i]);
        }
    };

    //se eliminan los controles
    if ( controlsFound )
        await Control.deleteMany( {id_mother} );

    //se eliminan los hijos
    if ( childsFound )
        await Child.deleteMany( {id_mother} );

    //se eliminan los datos de la madre asociados a los graphic
    deleteMotherGraphic(motherFound);

    //se elimina la madre del sistema
    await Mother.findByIdAndRemove ( id_mother );

    return res.status(200).send({ success: true, data:{}, message: 'Madre eliminada de manera correcta.' });
}

/**
 * Función que maneja la petición de obtener a una madre con sus datos de manera detallada del sistema.
 * @route Get /mother/:id
 * @param req Request de la petición, se espera que tenga la información de la madre obtenida
 * @param res Response, retorna un un object con success:true, data:{  mother:{} } y un message: "String" de la madre obtenida si todo sale bien
 */
export const getDetailedMother: RequestHandler = async (req, res) => {
    const _id = req.params.id;

    //se válida el _id ingresado
    if ( !Types.ObjectId.isValid( _id ))
        return res.status(400).send({ success: false, data:{}, message:'ERROR: El id ingresado no es válido.' });

    const motherFound = await Mother.findById( _id );

    //se válida la existencia de la madre en el sistema
    if( !motherFound )
        return res.status(404).send({ success: false, data:{}, message:'ERROR: La madre a obtener no existe en el sistema.' });

    //se seleccionan los atributos que se van a mandar al front
    const motherFiltered = destructureMother( motherFound );

    return res.status(200).send({ success: true, data:{ mother: motherFiltered }, message:'Madre encontrada y obtenida de manera correcta.' })
}

/**
 * Función que maneja la petición de obtener a todas las madres con sus nombres y rut's
 * @route Get /mother
 * @param req Request de la petición, se espera que no contenga nada
 * @param res Response, retorna un un object con success:true, data:{  listMothers:[{},{},...] } y un message: "String" de las madres obtenidas si todo sale bien
 */
export const getMothers: RequestHandler = async (req, res) => {
    const mothersFound = await Mother.find();

    //se valida la existencia de madres
    if ( !mothersFound )
        return res.status(404).send({ success: false, data:{}, message:'ERROR: No existen madres registradas en el sistema.' });

    //se filtran los datos publicos a retornar al front de cada madre
    const listMothers = mothersFound.map( mother => { return { _id: mother.id,  name: mother.name, rut: mother.rut }});

    return res.status(200).send({ success: true, data:{ list_of_mothers: listMothers }, message: "Se obtuvieron a todas las madres del sistema de manera exitosoa." });
}

/**
 * Extrae los atributos publicos del perfil de la madre obtenido desde la base de datos
 * @param motherFound Madre extraida de la base de datos
 * @returns Object con los atributos de la madre a enviar al front
 */
function destructureMother(motherFound: any) {
    const motherFiltered = {
        _id: motherFound._id,
        name: motherFound.name, 
        rut: motherFound.rut,
        commune: motherFound.commune,
        phone_number: motherFound.phone_number,
        mail: motherFound.mail,
        birth : motherFound.birth.toISOString().substring(0,10),
        ocupation: motherFound.ocupation,
        studies: motherFound.studies,
        marital_status: motherFound.marital_status,
        forecast: motherFound.forecast,
        number_of_living_children: motherFound.number_of_living_children,
        chronic_diseases: motherFound.chronic_diseases
    };

    return motherFiltered;
}

/**
 * Esta encargada de mantener un llamado a la función auxiliar de todos los datos a almacenar en la colección Graphics
 * @param mother Madre con todos los datos a guardar en la BD
 */
function addMotherGraphic( mother: any ) {
    addDataGraphic("commune",mother.commune);
    addDataGraphic("birth", mother.birth.toISOString().substring(0,4));
    addDataGraphic("studies", mother.studies);
    addDataGraphic("marital_status", mother.marital_status);
    addDataGraphic("forecast", mother.forecast);
    addDataGraphic("number_of_living_children", mother.number_of_living_children.toString());

    //se valida que el arreglo no venga vacío
    if ( mother.chronic_diseases.length > 0 ){
        addDataGraphic("chronic_diseases", mother.chronic_diseases);
    }
}

/**
 * Esta encargada de mantener un llamado a la función auxiliar de todos los datos a eliminar en la colección Graphics
 * @param mother Madre con todos los datos a eliminar en la BD
 */
export function deleteMotherGraphic( mother: any ) {
    if ( mother.commune != null ){ deleteDataGraphic("commune",mother.commune); };
    if ( mother.birth != null ){ deleteDataGraphic("birth", mother.birth.toISOString().substring(0,4)); };
    if ( mother.studies != null ){ deleteDataGraphic("studies", mother.studies); };
    if ( mother.marital_status != null ){ deleteDataGraphic("marital_status", mother.marital_status); };
    if ( mother.forecast != null ){ deleteDataGraphic("forecast", mother.forecast); };
    if ( mother.number_of_living_children != null ){ deleteDataGraphic("number_of_living_children", mother.number_of_living_children.toString()); };

    //se valida que el arreglo no venga vacío
    if ( mother.chronic_diseases.length > 0 ){
        deleteDataGraphic("chronic_diseases", mother.chronic_diseases);
    }
}
