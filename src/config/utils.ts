import { grey, green, blue, red, orange } from '@ant-design/colors';

export const SKILLS_LIST = [
  // General Categories
  { label: 'Frontend', value: 'FRONTEND' },
  { label: 'Backend', value: 'BACKEND' },
  { label: 'Fullstack', value: 'FULLSTACK' },
  { label: 'Mobile', value: 'MOBILE' },
  { label: 'DevOps', value: 'DEVOPS' },
  { label: 'QA', value: 'QA' },
  { label: 'Tester', value: 'TESTER' },
  { label: 'PM', value: 'PM' },
  { label: 'Designer', value: 'DESIGNER' },
  { label: 'Data Engineer', value: 'DATA_ENGINEER' },
  { label: 'Data Scientist', value: 'DATA_SCIENTIST' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Other', value: 'OTHER' },

  // Programming Languages
  { label: 'JavaScript', value: 'JAVASCRIPT' },
  { label: 'TypeScript', value: 'TYPESCRIPT' },
  { label: 'Java', value: 'JAVA' },
  { label: 'Python', value: 'PYTHON' },
  { label: 'C#', value: 'C_SHARP' },
  { label: 'C++', value: 'C_PLUS_PLUS' },
  { label: 'C', value: 'C' },
  { label: 'PHP', value: 'PHP' },
  { label: 'Ruby', value: 'RUBY' },
  { label: 'Go', value: 'GO' },
  { label: 'Rust', value: 'RUST' },
  { label: 'Swift', value: 'SWIFT' },
  { label: 'Kotlin', value: 'KOTLIN' },
  { label: 'Dart', value: 'DART' },
  { label: 'Scala', value: 'SCALA' },
  { label: 'R', value: 'R' },
  { label: 'MATLAB', value: 'MATLAB' },

  // JavaScript/TypeScript - Frontend Frameworks
  { label: 'React.JS', value: 'REACT.JS' },
  { label: 'Vue.JS', value: 'VUE.JS' },
  { label: 'Angular', value: 'ANGULAR' },
  { label: 'Svelte', value: 'SVELTE' },
  { label: 'Ember.js', value: 'EMBER.JS' },
  { label: 'Backbone.js', value: 'BACKBONE.JS' },
  { label: 'Alpine.js', value: 'ALPINE.JS' },
  { label: 'Preact', value: 'PREACT' },
  { label: 'Solid.js', value: 'SOLID.JS' },
  { label: 'Lit', value: 'LIT' },
  { label: 'Stencil', value: 'STENCIL' },
  { label: 'jQuery', value: 'JQUERY' },

  // JavaScript/TypeScript - Full-Stack Frameworks
  { label: 'Next.js', value: 'NEXT.JS' },
  { label: 'Nuxt.js', value: 'NUXT.JS' },
  { label: 'Remix', value: 'REMIX' },
  { label: 'Gatsby', value: 'GATSBY' },
  { label: 'Astro', value: 'ASTRO' },
  { label: 'SvelteKit', value: 'SVELTEKIT' },

  // JavaScript/TypeScript - State Management
  { label: 'Redux', value: 'REDUX' },
  { label: 'MobX', value: 'MOBX' },
  { label: 'Zustand', value: 'ZUSTAND' },
  { label: 'Jotai', value: 'JOTAI' },
  { label: 'Recoil', value: 'RECOIL' },
  { label: 'Pinia', value: 'PINIA' },
  { label: 'Vuex', value: 'VUEX' },
  { label: 'NgRx', value: 'NGRX' },

  // JavaScript/TypeScript - CSS Frameworks & Libraries
  { label: 'Tailwind CSS', value: 'TAILWIND_CSS' },
  { label: 'Bootstrap', value: 'BOOTSTRAP' },
  { label: 'Material-UI', value: 'MATERIAL_UI' },
  { label: 'Ant Design', value: 'ANT_DESIGN' },
  { label: 'Chakra UI', value: 'CHAKRA_UI' },
  { label: 'Mantine', value: 'MANTINE' },
  { label: 'Bulma', value: 'BULMA' },
  { label: 'Foundation', value: 'FOUNDATION' },
  { label: 'Semantic UI', value: 'SEMANTIC_UI' },
  { label: 'Styled Components', value: 'STYLED_COMPONENTS' },
  { label: 'Emotion', value: 'EMOTION' },
  { label: 'CSS Modules', value: 'CSS_MODULES' },
  { label: 'SASS/SCSS', value: 'SASS_SCSS' },
  { label: 'Less', value: 'LESS' },
  { label: 'Stylus', value: 'STYLUS' },

  // JavaScript/TypeScript - Build Tools & Bundlers
  { label: 'Webpack', value: 'WEBPACK' },
  { label: 'Vite', value: 'VITE' },
  { label: 'Parcel', value: 'PARCEL' },
  { label: 'Rollup', value: 'ROLLUP' },
  { label: 'esbuild', value: 'ESBUILD' },
  { label: 'SWC', value: 'SWC' },
  { label: 'Turbo', value: 'TURBO' },
  { label: 'Turborepo', value: 'TURBOREPO' },

  // JavaScript/TypeScript - Backend Frameworks
  { label: 'Node.js', value: 'NODE.JS' },
  { label: 'Express.js', value: 'EXPRESS.JS' },
  { label: 'Nest.JS', value: 'NEST.JS' },
  { label: 'Fastify', value: 'FASTIFY' },
  { label: 'Koa.js', value: 'KOA.JS' },
  { label: 'Hapi.js', value: 'HAPI.JS' },
  { label: 'Sails.js', value: 'SAILS.JS' },
  { label: 'AdonisJS', value: 'ADONISJS' },
  { label: 'Feathers.js', value: 'FEATHERS.JS' },
  { label: 'LoopBack', value: 'LOOPBACK' },
  { label: 'Meteor', value: 'METEOR' },
  { label: 'tRPC', value: 'TRPC' },

  // Java Frameworks
  { label: 'Spring Boot', value: 'SPRING_BOOT' },
  { label: 'Spring Framework', value: 'SPRING_FRAMEWORK' },
  { label: 'Spring MVC', value: 'SPRING_MVC' },
  { label: 'Spring Security', value: 'SPRING_SECURITY' },
  { label: 'Spring Data', value: 'SPRING_DATA' },
  { label: 'Spring Cloud', value: 'SPRING_CLOUD' },
  { label: 'Hibernate', value: 'HIBERNATE' },
  { label: 'Struts', value: 'STRUTS' },
  { label: 'Play Framework', value: 'PLAY_FRAMEWORK' },
  { label: 'Vaadin', value: 'VAADIN' },
  { label: 'Grails', value: 'GRAILS' },
  { label: 'Dropwizard', value: 'DROPWIZARD' },
  { label: 'Vert.x', value: 'VERT.X' },
  { label: 'Quarkus', value: 'QUARKUS' },
  { label: 'Micronaut', value: 'MICRONAUT' },
  { label: 'JSF', value: 'JSF' },
  { label: 'GWT', value: 'GWT' },
  { label: 'Apache Wicket', value: 'APACHE_WICKET' },

  // Python Frameworks
  { label: 'Django', value: 'DJANGO' },
  { label: 'Flask', value: 'FLASK' },
  { label: 'FastAPI', value: 'FASTAPI' },
  { label: 'Tornado', value: 'TORNADO' },
  { label: 'Bottle', value: 'BOTTLE' },
  { label: 'Pyramid', value: 'PYRAMID' },
  { label: 'CherryPy', value: 'CHERRYPY' },
  { label: 'Falcon', value: 'FALCON' },
  { label: 'Sanic', value: 'SANIC' },
  { label: 'Starlette', value: 'STARLETTE' },
  { label: 'Quart', value: 'QUART' },
  { label: 'Aiohttp', value: 'AIOHTTP' },
  { label: 'Twisted', value: 'TWISTED' },
  { label: 'Web2py', value: 'WEB2PY' },
  { label: 'TurboGears', value: 'TURBOGEARS' },

  // C# Frameworks
  { label: 'ASP.NET', value: 'ASP_NET' },
  { label: 'ASP.NET Core', value: 'ASP_NET_CORE' },
  { label: '.NET Core', value: 'NET_CORE' },
  { label: '.NET Framework', value: 'NET_FRAMEWORK' },
  { label: '.NET 5/6/7/8', value: 'NET_5_6_7_8' },
  { label: 'Blazor', value: 'BLAZOR' },
  { label: 'Entity Framework', value: 'ENTITY_FRAMEWORK' },
  { label: 'Dapper', value: 'DAPPER' },
  { label: 'NHibernate', value: 'NHIBERNATE' },
  { label: 'Nancy', value: 'NANCY' },
  { label: 'ServiceStack', value: 'SERVICESTACK' },
  { label: 'Orleans', value: 'ORLEANS' },

  // PHP Frameworks
  { label: 'Laravel', value: 'LARAVEL' },
  { label: 'Symfony', value: 'SYMFONY' },
  { label: 'CodeIgniter', value: 'CODEIGNITER' },
  { label: 'Zend Framework', value: 'ZEND_FRAMEWORK' },
  { label: 'Laminas', value: 'LAMINAS' },
  { label: 'Yii', value: 'YII' },
  { label: 'CakePHP', value: 'CAKEPHP' },
  { label: 'Phalcon', value: 'PHALCON' },
  { label: 'Slim', value: 'SLIM' },
  { label: 'Lumen', value: 'LUMEN' },
  { label: 'FuelPHP', value: 'FUELPHP' },
  { label: 'Aura', value: 'AURA' },

  // Ruby Frameworks
  { label: 'Ruby on Rails', value: 'RUBY_ON_RAILS' },
  { label: 'Sinatra', value: 'SINATRA' },
  { label: 'Hanami', value: 'HANAMI' },
  { label: 'Grape', value: 'GRAPE' },
  { label: 'Padrino', value: 'PADRINO' },
  { label: 'Cuba', value: 'CUBA' },

  // Go Frameworks
  { label: 'Gin', value: 'GIN' },
  { label: 'Echo', value: 'ECHO' },
  { label: 'Fiber', value: 'FIBER' },
  { label: 'Beego', value: 'BEEGO' },
  { label: 'Revel', value: 'REVEL' },
  { label: 'Buffalo', value: 'BUFFALO' },
  { label: 'Gorilla', value: 'GORILLA' },
  { label: 'Chi', value: 'CHI' },
  { label: 'Iris', value: 'IRIS' },
  { label: 'Martini', value: 'MARTINI' },
  { label: 'Negroni', value: 'NEGRONI' },

  // Rust Frameworks
  { label: 'Actix', value: 'ACTIX' },
  { label: 'Rocket', value: 'ROCKET' },
  { label: 'Warp', value: 'WARP' },
  { label: 'Axum', value: 'AXUM' },
  { label: 'Tide', value: 'TIDE' },
  { label: 'Gotham', value: 'GOTHAM' },

  // Swift Frameworks
  { label: 'Vapor', value: 'VAPOR' },
  { label: 'Perfect', value: 'PERFECT' },
  { label: 'Kitura', value: 'KITURA' },
  { label: 'SwiftUI', value: 'SWIFTUI' },
  { label: 'UIKit', value: 'UIKIT' },
  { label: 'Combine', value: 'COMBINE' },

  // Kotlin Frameworks
  { label: 'Ktor', value: 'KTOR' },
  { label: 'Spring Boot Kotlin', value: 'SPRING_BOOT_KOTLIN' },
  { label: 'Vert.x Kotlin', value: 'VERT.X_KOTLIN' },
  { label: 'Android Jetpack', value: 'ANDROID_JETPACK' },
  { label: 'Compose', value: 'COMPOSE' },

  // Scala Frameworks
  { label: 'Play Framework', value: 'PLAY_FRAMEWORK_SCALA' },
  { label: 'Akka', value: 'AKKA' },
  { label: 'Lift', value: 'LIFT' },
  { label: 'Finatra', value: 'FINATRA' },
  { label: 'Scalatra', value: 'SCALATRA' },
  { label: 'http4s', value: 'HTTP4S' },

  // C++ Frameworks
  { label: 'Qt', value: 'QT' },
  { label: 'Boost', value: 'BOOST' },
  { label: 'POCO', value: 'POCO' },
  { label: 'Crow', value: 'CROW' },
  { label: 'Drogon', value: 'DROGON' },
  { label: 'Wt', value: 'WT' },

  // R Frameworks
  { label: 'Shiny', value: 'SHINY' },
  { label: 'Plumber', value: 'PLUMBER' },
  { label: 'Tidyverse', value: 'TIDYVERSE' },

  // Dart Frameworks
  { label: 'Aqueduct', value: 'AQUEDUCT' },
  { label: 'Angel', value: 'ANGEL' },

  // Mobile Development
  { label: 'React Native', value: 'REACT_NATIVE' },
  { label: 'Flutter', value: 'FLUTTER' },
  { label: 'Ionic', value: 'IONIC' },
  { label: 'Xamarin', value: 'XAMARIN' },
  { label: 'Native iOS', value: 'NATIVE_IOS' },
  { label: 'Native Android', value: 'NATIVE_ANDROID' },

  // Databases
  { label: 'MySQL', value: 'MYSQL' },
  { label: 'PostgreSQL', value: 'POSTGRESQL' },
  { label: 'MongoDB', value: 'MONGODB' },
  { label: 'Redis', value: 'REDIS' },
  { label: 'Oracle', value: 'ORACLE' },
  { label: 'SQL Server', value: 'SQL_SERVER' },
  { label: 'SQLite', value: 'SQLITE' },
  { label: 'MariaDB', value: 'MARIADB' },
  { label: 'Cassandra', value: 'CASSANDRA' },
  { label: 'Elasticsearch', value: 'ELASTICSEARCH' },
  { label: 'DynamoDB', value: 'DYNAMODB' },
  { label: 'Firebase', value: 'FIREBASE' },
  { label: 'Supabase', value: 'SUPABASE' },
  { label: 'Neo4j', value: 'NEO4J' },
  { label: 'InfluxDB', value: 'INFLUXDB' },

  // Cloud & DevOps
  { label: 'AWS', value: 'AWS' },
  { label: 'Azure', value: 'AZURE' },
  { label: 'Google Cloud', value: 'GOOGLE_CLOUD' },
  { label: 'Docker', value: 'DOCKER' },
  { label: 'Kubernetes', value: 'KUBERNETES' },
  { label: 'Jenkins', value: 'JENKINS' },
  { label: 'GitLab CI/CD', value: 'GITLAB_CI_CD' },
  { label: 'GitHub Actions', value: 'GITHUB_ACTIONS' },
  { label: 'Terraform', value: 'TERRAFORM' },
  { label: 'Ansible', value: 'ANSIBLE' },
  { label: 'Chef', value: 'CHEF' },
  { label: 'Puppet', value: 'PUPPET' },
  { label: 'Prometheus', value: 'PROMETHEUS' },
  { label: 'Grafana', value: 'GRAFANA' },
  { label: 'ELK Stack', value: 'ELK_STACK' },
  { label: 'Nginx', value: 'NGINX' },
  { label: 'Apache', value: 'APACHE' },

  // Testing
  { label: 'Jest', value: 'JEST' },
  { label: 'Mocha', value: 'MOCHA' },
  { label: 'Cypress', value: 'CYPRESS' },
  { label: 'Selenium', value: 'SELENIUM' },
  { label: 'Playwright', value: 'PLAYWRIGHT' },
  { label: 'JUnit', value: 'JUNIT' },
  { label: 'PyTest', value: 'PYTEST' },
  { label: 'RSpec', value: 'RSPEC' },
  { label: 'Postman', value: 'POSTMAN' },
  { label: 'JMeter', value: 'JMETER' },

  // Data & Analytics
  { label: 'Apache Spark', value: 'APACHE_SPARK' },
  { label: 'Hadoop', value: 'HADOOP' },
  { label: 'Kafka', value: 'KAFKA' },
  { label: 'Airflow', value: 'AIRFLOW' },
  { label: 'Tableau', value: 'TABLEAU' },
  { label: 'Power BI', value: 'POWER_BI' },
  { label: 'Looker', value: 'LOOKER' },
  { label: 'Pandas', value: 'PANDAS' },
  { label: 'NumPy', value: 'NUMPY' },
  { label: 'TensorFlow', value: 'TENSORFLOW' },
  { label: 'PyTorch', value: 'PYTORCH' },
  { label: 'Scikit-learn', value: 'SCIKIT_LEARN' },

  // Version Control & Tools
  { label: 'Git', value: 'GIT' },
  { label: 'SVN', value: 'SVN' },
  { label: 'Mercurial', value: 'MERCURIAL' },

  // Design & UI/UX Tools
  { label: 'Figma', value: 'FIGMA' },
  { label: 'Adobe XD', value: 'ADOBE_XD' },
  { label: 'Sketch', value: 'SKETCH' },
  { label: 'Photoshop', value: 'PHOTOSHOP' },
  { label: 'Illustrator', value: 'ILLUSTRATOR' },
  { label: 'InVision', value: 'INVISION' },
  { label: 'Zeplin', value: 'ZEPLIN' },

  // Project Management & Methodologies
  { label: 'Agile', value: 'AGILE' },
  { label: 'Scrum', value: 'SCRUM' },
  { label: 'Kanban', value: 'KANBAN' },
  { label: 'Jira', value: 'JIRA' },
  { label: 'Confluence', value: 'CONFLUENCE' },
  { label: 'Trello', value: 'TRELLO' },
  { label: 'Asana', value: 'ASANA' },

  // Microservices & Architecture
  { label: 'Microservices', value: 'MICROSERVICES' },
  { label: 'REST API', value: 'REST_API' },
  { label: 'GraphQL', value: 'GRAPHQL' },
  { label: 'gRPC', value: 'GRPC' },
  { label: 'RabbitMQ', value: 'RABBITMQ' },
  { label: 'Apache Kafka', value: 'APACHE_KAFKA' },

  // Blockchain
  { label: 'Blockchain', value: 'BLOCKCHAIN' },
  { label: 'Solidity', value: 'SOLIDITY' },
  { label: 'Web3', value: 'WEB3' },
  { label: 'Ethereum', value: 'ETHEREUM' },

  // All Skills Option
  { label: 'Tất cả kỹ năng', value: 'ALL_SKILLS' },
];

export const LOCATION_LIST = [
  { label: 'An Giang', value: 'AN_GIANG' },
  { label: 'Bà Rịa - Vũng Tàu', value: 'BA_RIA_VUNG_TAU' },
  { label: 'Bắc Giang', value: 'BAC_GIANG' },
  { label: 'Bắc Kạn', value: 'BAC_KAN' },
  { label: 'Bạc Liêu', value: 'BAC_LIEU' },
  { label: 'Bắc Ninh', value: 'BAC_NINH' },
  { label: 'Bến Tre', value: 'BEN_TRE' },
  { label: 'Bình Định', value: 'BINH_DINH' },
  { label: 'Bình Dương', value: 'BINH_DUONG' },
  { label: 'Bình Phước', value: 'BINH_PHUOC' },
  { label: 'Bình Thuận', value: 'BINH_THUAN' },
  { label: 'Cà Mau', value: 'CA_MAU' },
  { label: 'Cần Thơ', value: 'CAN_THO' },
  { label: 'Cao Bằng', value: 'CAO_BANG' },
  { label: 'Đà Nẵng', value: 'DA_NANG' },
  { label: 'Đắk Lắk', value: 'DAK_LAK' },
  { label: 'Đắk Nông', value: 'DAK_NONG' },
  { label: 'Điện Biên', value: 'DIEN_BIEN' },
  { label: 'Đồng Nai', value: 'DONG_NAI' },
  { label: 'Đồng Tháp', value: 'DONG_THAP' },
  { label: 'Gia Lai', value: 'GIA_LAI' },
  { label: 'Hà Giang', value: 'HA_GIANG' },
  { label: 'Hà Nam', value: 'HA_NAM' },
  { label: 'Hà Nội', value: 'HA_NOI' },
  { label: 'Hà Tĩnh', value: 'HA_TINH' },
  { label: 'Hải Dương', value: 'HAI_DUONG' },
  { label: 'Hải Phòng', value: 'HAI_PHONG' },
  { label: 'Hậu Giang', value: 'HAU_GIANG' },
  { label: 'Hòa Bình', value: 'HOA_BINH' },
  { label: 'Hưng Yên', value: 'HUNG_YEN' },
  { label: 'Khánh Hòa', value: 'KHANH_HOA' },
  { label: 'Kiên Giang', value: 'KIEN_GIANG' },
  { label: 'Kon Tum', value: 'KON_TUM' },
  { label: 'Lai Châu', value: 'LAI_CHAU' },
  { label: 'Lâm Đồng', value: 'LAM_DONG' },
  { label: 'Lạng Sơn', value: 'LANG_SON' },
  { label: 'Lào Cai', value: 'LAO_CAI' },
  { label: 'Long An', value: 'LONG_AN' },
  { label: 'Nam Định', value: 'NAM_DINH' },
  { label: 'Nghệ An', value: 'NGHE_AN' },
  { label: 'Ninh Bình', value: 'NINH_BINH' },
  { label: 'Ninh Thuận', value: 'NINH_THUAN' },
  { label: 'Phú Thọ', value: 'PHU_THO' },
  { label: 'Phú Yên', value: 'PHU_YEN' },
  { label: 'Quảng Bình', value: 'QUANG_BINH' },
  { label: 'Quảng Nam', value: 'QUANG_NAM' },
  { label: 'Quảng Ngãi', value: 'QUANG_NGAI' },
  { label: 'Quảng Ninh', value: 'QUANG_NINH' },
  { label: 'Quảng Trị', value: 'QUANG_TRI' },
  { label: 'Sóc Trăng', value: 'SOC_TRANG' },
  { label: 'Sơn La', value: 'SON_LA' },
  { label: 'Tây Ninh', value: 'TAY_NINH' },
  { label: 'Thái Bình', value: 'THAI_BINH' },
  { label: 'Thái Nguyên', value: 'THAI_NGUYEN' },
  { label: 'Thanh Hóa', value: 'THANH_HOA' },
  { label: 'Thừa Thiên Huế', value: 'THUA_THIEN_HUE' },
  { label: 'Tiền Giang', value: 'TIEN_GIANG' },
  { label: 'TP. Hồ Chí Minh', value: 'HO_CHI_MINH' },
  { label: 'Trà Vinh', value: 'TRA_VINH' },
  { label: 'Tuyên Quang', value: 'TUYEN_QUANG' },
  { label: 'Vĩnh Long', value: 'VINH_LONG' },
  { label: 'Vĩnh Phúc', value: 'VINH_PHUC' },
  { label: 'Yên Bái', value: 'YEN_BAI' },
  { label: 'Tất cả tỉnh thành', value: 'ALL' },
];

export const nonAccentVietnamese = (str: string) => {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, 'A');
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, 'E');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, 'I');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, 'O');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, 'U');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, 'Y');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/đ/g, 'd');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
  return str;
};

export const convertSlug = (str: string) => {
  str = nonAccentVietnamese(str);
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from =
    'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;';
  const to =
    'AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};

export const getLocationName = (value: string) => {
  const locationFilter = LOCATION_LIST.filter(item => item.value === value);
  if (locationFilter.length) return locationFilter[0].label;
  return 'unknown';
};

export function colorMethod(method: 'POST' | 'PUT' | 'GET' | 'DELETE' | string) {
  switch (method) {
    case 'POST':
      return green[6];
    case 'PUT':
      return orange[6];
    case 'GET':
      return blue[6];
    case 'DELETE':
      return red[6];
    default:
      return grey[10];
  }
}
