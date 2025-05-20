const Upimgs = require("../models/Imagens")

exports.create = async (req, res) => {
    
    try {
        const {name} = req.body
        const file = req.file
        
        const Img = new Upimgs({
            name,
            src: file.path,
        })

        await Img.save()

        res.json({Img, msg: "imagem salva"});

    } catch (error){
        res.status(500).json({message: "erro ao salvar a imagem"})
    }
};