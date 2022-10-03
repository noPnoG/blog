const imgs =document.getElementsByTagName('img')

//innerHeight是浏览器内部高度

//scrollTop是浏览器滚动高度

//offsetTop是图片图片离页面顶部的高度

//当scrollTop>offsetTop-innerHeight时加载图片


function lazyLoad(){
  const innerHeight = window.innerHeight
  Array.from(imgs).forEach((img)=>{
    if(img.src)return
    const scrollTop = document.scrollTop||document.documentElement.scrollTop
    const offsetTop = img.offsetTop
    if(scrollTop>offsetTop-innerHeight){
      img.src = img.getAttribute('data-src')
    }
  })
}
// window.addEventListener('scroll',lazyLoad)

//Intersection Observer方式

window.addEventListener('DOMContentLoaded',()=>{
  const lazyImages =[].slice.call(document.querySelectorAll('img.pic'))
  const lazyImageObserver = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
          const imgEl = entry.target
          imgEl.src = imgEl.dataset.src
          imgEl.classList.remove("lazy");
          lazyImageObserver.unobserve(imgEl);

      }
    })
  })
  lazyImages.forEach((lazyImage)=>{
    lazyImageObserver.observe(lazyImage)
  })
})