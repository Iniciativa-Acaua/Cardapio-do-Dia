export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <p className="text-center">Siga-nos nas redes sociais:</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-white hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20"><path fill="currentColor" d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6s9.6-4.298 9.6-9.6S15.302.4 10 .4m2.274 6.634h-1.443c-.171 0-.361.225-.361.524V8.6h1.805l-.273 1.486H10.47v4.461H8.767v-4.461H7.222V8.6h1.545v-.874c0-1.254.87-2.273 2.064-2.273h1.443z"/></svg>  
          </a>
          <a href="#" className="text-white hover:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20"><path fill="currentColor" d="M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6s9.6-4.298 9.6-9.6S15.302.4 10 .4m3.905 7.864q.005.123.005.244c0 2.5-1.901 5.381-5.379 5.381a5.34 5.34 0 0 1-2.898-.85q.221.026.451.025c.886 0 1.701-.301 2.348-.809a1.895 1.895 0 0 1-1.766-1.312a1.9 1.9 0 0 0 .853-.033a1.89 1.89 0 0 1-1.517-1.854v-.023c.255.141.547.227.857.237a1.89 1.89 0 0 1-.585-2.526a5.38 5.38 0 0 0 3.897 1.977a1.891 1.891 0 0 1 3.222-1.725a3.8 3.8 0 0 0 1.2-.459a1.9 1.9 0 0 1-.831 1.047a3.8 3.8 0 0 0 1.086-.299a3.8 3.8 0 0 1-.943.979"/></svg>
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20"><path fill="currentColor" d="M13 10a3 3 0 1 1-6 0q.001-.257.049-.5H6v3.997c0 .278.225.503.503.503h6.995a.503.503 0 0 0 .502-.503V9.5h-1.049q.048.243.049.5m-3 2a2 2 0 1 0-.001-4.001A2 2 0 0 0 10 12m2.4-4.1h1.199a.3.3 0 0 0 .301-.3V6.401a.3.3 0 0 0-.301-.301H12.4a.3.3 0 0 0-.301.301V7.6c.001.165.136.3.301.3M10 .4A9.6 9.6 0 0 0 .4 10a9.6 9.6 0 0 0 9.6 9.6a9.6 9.6 0 0 0 9.6-9.6A9.6 9.6 0 0 0 10 .4m5 13.489C15 14.5 14.5 15 13.889 15H6.111C5.5 15 5 14.5 5 13.889V6.111C5 5.5 5.5 5 6.111 5h7.778C14.5 5 15 5.5 15 6.111z"/></svg>
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-4">
        <p className="text-center">Contato: (11) 1234-5678</p>
      </div>
      <div className="container mx-auto px-4">
        <p className="text-center">&copy; 2026 Meu App. Todos os direitos reservados.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="/privacy-policy" className="text-white hover:text-gray-400">
            Política de Privacidade
          </a>
          <a href="/about" className="text-white hover:text-gray-400">
            Desenvolvido pela Iniciativa Acauã
          </a>
        </div>
      </div>
    </footer>
  );
}