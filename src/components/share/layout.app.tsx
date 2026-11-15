import Header from '../client/header.client';
import Footer from '../client/footer.client';

interface IProps {
  children: React.ReactNode;
}

const LayoutApp = (props: IProps) => {
  return (
    <div className='layout-app'>
      <Header />
      <main>{props.children}</main>
      <Footer />
    </div>
  );
};

export default LayoutApp;
