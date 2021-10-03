var wue = {
    createApp(options){
        return new Wue(options);
    }
}
class Wue{
    // Dependencies
    deps = new Map();

    constructor(options){
        this.origen = options.data()

        const self = this;

        // DESTINO
        this.$data = new Proxy(this.origen, {
            get(target, name){
                if(Reflect.has(target, name)){
                    self.track(target, name)
                    return Reflect.get(target, name)
                } 
                console.warn("El atributo", name, "no existe")
                return ""
            },
            set(target, name, value){
                Reflect.set(target, name, value)
                self.trigger(name)
            }
        })
    }

    track(target, name){
        if(!this.deps.has(name)){
            const effect = () => {
                document.querySelectorAll(`*[w-text=${name}]`).forEach(el => {
                    this.wText(el, target, name)
                })
                document.querySelectorAll(`*[w-model=${name}]`).forEach(el => {
                    this.wModel(el, target, name)
                })

                Array.from(document.querySelectorAll('*')).filter(el => {
                    return [...el.attributes].forEach(attr => {
                        if(attr.name.startsWith("w-bind:")){
                            const name = attr.value
                            const _attr = attr.name.split(":").pop()
                            this.wBind(el, target, name, _attr)
                        }
                    })
                })
            }
            this.deps.set(name, effect)
        }
    }
    trigger(name){
        const effect = this.deps.get(name)
        effect()
    }
    mount(){
        document.querySelectorAll("*[w-text]").forEach(el => {
            this.wText(el, this.$data, el.getAttribute("w-text"))
        })
        document.querySelectorAll("*[w-model]").forEach(el => {
            const name = el.getAttribute("w-model")
            this.wModel(el, this.$data, name)
            
            el.addEventListener("input", () => {
                Reflect.set(this.$data, name, el.value)
            })
        })
        Array.from(document.querySelectorAll("*")).filter(el => {
            return [...el.attributes].some(attr => attr.name.startsWith("w-bind:"))
        }).forEach(el => {
            return [...el.attributes].forEach(attribute =>{
                if(attribute.name.startsWith("w-bind:")){
                    const name = attribute.value
                    const attr = attribute.name.split(":").pop()
                    this.wBind(el, this.$data, name, attr)
                }
            })
        })
    }
    wText(el, target, name){
        el.innerText = Reflect.get(target, name);
    }
    wModel(el, target, name){
        el.value = Reflect.get(target, name);
    }
    wBind(el, target, name, attr){
        el.setAttribute(attr, Reflect.get(target, name))
        // el.value = Reflect.get(target, name);
    }
}