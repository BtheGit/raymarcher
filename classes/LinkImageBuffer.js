class LinkImageBuffer extends ImageBuffer {
  constructor(href, image){
    super(image)
    this.href = href;
  }

  trigger(){
    // If this link has been triggered we want to
    // a) Store current state in sessionStorage TODO:
    // b) Tell the browser to go to the link
    console.log('You hit me!')
  }
}
