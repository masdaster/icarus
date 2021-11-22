import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html lang='en'>
        <Head />
        <script dangerouslySetInnerHTML={{
          __html: `
          document.oncontextmenu = (e) => e.preventDefault()
        `
        }}
        />
        <body className='not-selectable'>
          <div id='background' />
          <div id='main'>
            <Main />
            <NextScript />
          </div>
        </body>
      </Html>
    )
  }
}

export default MyDocument
