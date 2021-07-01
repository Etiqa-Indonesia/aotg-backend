const { findAllAgentCategory,findAllDependenciesAgentCategory, submitAgentDependencies } = require('../../services/backoffice/agentcat.service')


exports.findAllAgentCategory = async (req, res) => {
    try {
        const AgentCat = await findAllAgentCategory();

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': AgentCat
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};

exports.findAllDependenciesAgentCategory = async (req, res) => {
    try {

        const AgentDependencies = await findAllDependenciesAgentCategory(req.params.agentcat);

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': AgentDependencies
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};

exports.submitAgentDependencies = async (req, res) => {
    try {

        const Results = await submitAgentDependencies(req.body);
        res.status(200).send({
            'code': '200',
            'message': 'Success Insert Agent Dependencies'
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};