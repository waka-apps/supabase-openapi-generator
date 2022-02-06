// import { createClient } from '@supabase/supabase-js';
import { Command } from 'commander';
import axios from 'axios';
import fs from 'fs';
import openapiTS from "openapi-typescript";

const program = new Command();
program.version('1.0.0');
program.option('-o, --output <string>', 'The specification and schema file output destination');
program.requiredOption('-u, --supabase-url <string>', 'Your supabase URL');
program.requiredOption('-a, --supabase-anon-key <string>', 'Your supabase anon key');
program.parse(process.argv);

console.log(program.opts());

// const supabase = createClient(program.opts().supabaseUrl, program.opts().supabaseAnonKey);
const schemaUrl = `${program.opts().supabaseUrl}/rest/v1/?apikey=${program.opts().supabaseAnonKey}`;

const getPath = (param) => {
    const outputDir = !param ? '.' : param.slice(-1) === '/' ? param.slice(0, -1)  : param;
    return `${outputDir}/build`;
};

await (async () =>{
    console.log(`********** START ********** : ${schemaUrl}`);
    try {
        const result = await axios.get(schemaUrl);
        // console.log(`${JSON.stringify(result.data)}`);
        const path = getPath(program.opts().output);
        !fs.existsSync(path) && fs.mkdirSync(path, { recursive: false }, (err) => {
            err && console.log('********** mkdir ERROR **********', err);
            throw err;
        });
        
        const output = await openapiTS(result.data);

        fs.writeFileSync(`${path}/schema.ts`, output, err => {
            err && console.log('********** Write file ERROR **********', err);
            throw err;
        });
        console.log(output);
        
        console.log('********** SUCCESS **********');
    } catch (e) {
        console.log('********** ERROR **********', e);
    }
})();
