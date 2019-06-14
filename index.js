"use strict";
///<reference path="./typings.d.ts"/>
var semverRegex = require("semver-regex"); // used for the string formats
var semver = require("resin-semver"); // used for everything else
module.exports = function (ajv) {
    ajv.addFormat('semver', semverRegex);
    ajv.addKeyword('semver', {
        modifying: true,
        compile: function (schema, par, it) {
            var _method;
            if (typeof schema === 'boolean') {
                return function (data) {
                    return semver.valid(data) !== null;
                };
            }
            else if (schema.valid !== undefined) {
                return function (data) {
                    return semver.valid(data) !== null;
                };
            }
            else if (schema.prerelease !== undefined) {
                return function (data) {
                    return semver.prerelease(data) !== null;
                };
                // MODIFYING KEYWORDS
            }
            else if (schema.major !== undefined) {
                _method = 'major';
            }
            else if (schema.minor !== undefined) {
                _method = 'minor';
            }
            else if (schema.patch !== undefined) {
                _method = 'patch';
                // RELATIONAL KEYWORDS
            }
            else if (schema.satisfies !== undefined) {
                _method = 'satisfies';
            }
            else if (schema.gt !== undefined) {
                _method = 'gt';
            }
            else if (schema.gte !== undefined) {
                _method = 'gte';
            }
            else if (schema.lt !== undefined) {
                _method = 'lt';
            }
            else if (schema.lte !== undefined) {
                _method = 'lte';
            }
            else {
                throw new Error('Schema Error: this should be prevented by the metaSchema. Got schema:' +
                    JSON.stringify(schema));
            }
            var out;
            switch (_method) {
                case 'major':
                case 'minor':
                case 'patch':
                case 'satisfies':
                case 'lte':
                case 'gte':
                default: {
                    // RELATIONAL KEYWORDS
                    var _data = schema[_method].$data
                        ? it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr)
                        : "\"" + schema[_method] + "\"";
                    out = Function('inst', 'path', 'parent', 'prop_name', 'data', "if(this.semver.valid(" + _data + ")===null){return false;}if(this.semver.valid(inst)===null){return false;};return this.semver." + _method + "(inst," + _data + ");");
                }
            }
            return out.bind({
                semver: semver
            });
        },
        metaSchema: {
            oneOf: [
                { type: 'boolean' },
                {
                    type: 'object',
                    properties: {
                        major: { $ref: '#/bool_or_ref' },
                        minor: { $ref: '#/bool_or_ref' },
                        patch: { $ref: '#/bool_or_ref' },
                        satisfies: { $ref: '#/string_or_ref' },
                        gt: { $ref: '#/string_or_ref' },
                        gte: { $ref: '#/string_or_ref' },
                        lt: { $ref: '#/string_or_ref' },
                        lte: { $ref: '#/string_or_ref' },
                        valid: { type: 'boolean' },
                        prerelease: { type: 'boolean' }
                    },
                    oneOf: [
                        { required: ['major'] },
                        { required: ['minor'] },
                        { required: ['patch'] },
                        { required: ['satisfies'] },
                        { required: ['gt'] },
                        { required: ['gte'] },
                        { required: ['lt'] },
                        { required: ['lte'] },
                        { required: ['valid'] },
                        { required: ['prerelease'] }
                    ]
                }
            ],
            bool_or_ref: {
                oneOf: [
                    { type: 'boolean' },
                    {
                        type: 'object',
                        properties: {
                            $data: { type: 'string' }
                        },
                        required: ['$data'],
                        maxProperties: 1
                    }
                ]
            },
            string_or_ref: {
                oneOf: [
                    { type: 'string' },
                    {
                        type: 'object',
                        properties: {
                            $data: { type: 'string' }
                        },
                        required: ['$data'],
                        maxProperties: 1
                    }
                ]
            }
        }
    });
};
