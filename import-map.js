// in the future can prob do : <script type="importmap" src="/import-map.json"></script>
document.body.appendChild(Object.assign(document.createElement('script'), {
type		: 'importmap',
innerHTML	: `
    {"imports":{
        "three"             : "/thirdparty/three.module.min.js",
        "OrbitControls"	    : "/thirdparty/OrbitControls.js",
        "gltfParser"        : "/thirdparty/gltf2parser.es.js",
        "gl-matrix"         : "/thirdparty/gl-matrix/index.js"
    }}
`}));