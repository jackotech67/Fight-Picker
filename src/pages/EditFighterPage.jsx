import { useParams } from "react-router-dom";
import FighterFormPage from "./FighterFormPage";

function EditFighterPage() {
    const { id } = useParams();

    return (
        <>
            <FighterFormPage
                mode="edit"
                fighterId={id}
            />  
        </>
    );
}

export default EditFighterPage;