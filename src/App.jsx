import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Phone, 
  Mail,
  Bus,
  Camera,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  User,
  X,
  Plus,
  Minus,
  UserPlus
} from 'lucide-react';


function App() {
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentGrade: '',
    studentClass: '',
    parentName: '',
    cpf: '',
    email: '',
    phone: '',
    paymentMethod: 'pix',
    installments: 1,
    additionalCompanions: 0 // Novo campo para acompanhantes adicionais
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Função para mostrar formulário
  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('formulario-inscricao')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Funções para controlar acompanhantes
  const increaseCompanions = () => {
    if (formData.additionalCompanions < 5) {
      setFormData(prev => ({ 
        ...prev, 
        additionalCompanions: prev.additionalCompanions + 1 
      }));
    }
  };

  const decreaseCompanions = () => {
    if (formData.additionalCompanions > 0) {
      setFormData(prev => ({ 
        ...prev, 
        additionalCompanions: prev.additionalCompanions - 1 
      }));
    }
  };

  // Cálculo de preço atualizado
  const calculatePrice = () => {
    const PRECO_BASE = 70.0;
    const PRECO_ACOMPANHANTE = 20.0;
    
    let valorTotal = PRECO_BASE + (formData.additionalCompanions * PRECO_ACOMPANHANTE);
    
    if (formData.paymentMethod === 'credit') {
      let taxaPercentual = 0;
      const taxaFixa = 0.49;
      const parcelas = parseInt(formData.installments) || 1;
      
      if (parcelas === 1) {
        taxaPercentual = 0.0299;
      } else if (parcelas >= 2 && parcelas <= 4) {
        taxaPercentual = 0.0349;
      } else {
        taxaPercentual = 0.0399;
      }
      
      valorTotal = valorTotal + (valorTotal * taxaPercentual) + taxaFixa;
    }
    
    const valorParcela = valorTotal / (parseInt(formData.installments) || 1);
    return { valorTotal, valorParcela };
  };

  const { valorTotal, valorParcela } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
      // Aplicar máscara de CPF
    if (name === 'cpf') {
      const cpfValue = value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona primeiro ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona segundo ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona hífen
    
      setFormData(prev => ({ ...prev, [name]: cpfValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {  
      // Enviar dados para o webhook do n8n
      const response = await fetch('https://webhook.escolaamadeus.com/webhook/diadospais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentGrade: formData.studentGrade,
          studentClass: formData.studentClass,
          parentName: formData.parentName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
          installments: formData.installments,
          additionalCompanions: formData.additionalCompanions, // Incluir acompanhantes
          amount: valorTotal,
          timestamp: new Date().toISOString(),
          event: 'Passeio Game Station Partage'
        })
      });

      if (response.ok) {
          // Pegar a resposta do n8n PRIMEIRO
          const responseData = await response.json();
          console.log('Resposta do n8n:', responseData); // Para debug
          // Mostrar tela de sucesso
        setInscriptionSuccess(true);
  
        // Redirecionar para o Asaas após 2 segundos
        setTimeout(() => {
          if (responseData.paymentUrl) {
            window.location.href = responseData.paymentUrl;
          } else {
            console.log('Link de pagamento não encontrado na resposta');
            alert('Erro: Link de pagamento não encontrado. Entre em contato conosco.');
          }
        }, 1000);
      } else {
        throw new Error('Erro ao enviar dados para o servidor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (inscriptionSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Aguarde!</CardTitle>
            <CardDescription>Redirecionando para o pagamento...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Seus dados foram registrados com sucesso. Em instantes você será redirecionado para finalizar o pagamento.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen smooth-scroll">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-900">Escola Amadeus</h1>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('sobre')} className="text-sm hover:text-primary transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('Programação do Evento')} className="text-sm hover:text-primary transition-colors">Programação do Evento</button>
              <button onClick={() => scrollToSection('custos')} className="text-sm hover:text-primary transition-colors">Custos</button>
              <button onClick={() => scrollToSection('Observação')} className="text-sm hover:text-primary transition-colors">Observação</button>
              <button onClick={() => scrollToSection('orientacoes')} className="text-sm hover:text-primary transition-colors">Orientações</button>
              <button onClick={() => scrollToSection('contato')} className="text-sm hover:text-primary transition-colors">Contato</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white relative">
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Dia dos Pais
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Uma tarde inesquecível de amor, diversão e memórias especiais com quem você mais ama!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 bg-white text-primary"
              onClick={() => scrollToSection("sobre")}
            >
              Saiba Mais
            </Button>
          </div>
          <div className="mt-12 flex justify-center items-center space-x-8 text-sm">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              16 de Agosto de 2025 - a partir das 14h
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Na Escola Amadeus, São Gonçalo do Amarante - RN
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Passeio */}
      <section id="sobre" className="section-padding bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Sobre o Evento</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Um momento único para criar memórias especiais ao lado de quem mais importa. Venha viver uma tarde repleta de diversão, competições e muito carinho em um ambiente pensado especialmente para celebrar o amor entre pais e filhos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Uma Experiência Única</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Evento exclusivo para nossa comunidade escolar</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Competição Pais & Filhos - Reversamento de obstáculos, brincadeiras e muito mais!</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Cabine de fotos temáticas </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Entrega de medalhas - para os participantes</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Lembracinha especial para cada pai presente</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Pipoca e Algodão-doce à vontade</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Decoração para o dia dos pais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerário */}
      <section id="itinerario" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Programação do Evento</h2>
            <p className="text-lg text-muted-foreground">
              Confira o cronograma da nossa tarde especial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>14:00</CardTitle>
                <CardDescription>Chegada e recepção</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Chegada das famílias na escola Amadeus. Recepção com pipoca e algodão-doce para começar a festa!
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Tarde</CardTitle>
                <CardDescription>Atividades e diversão</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Competições pais & filhos, cabine de fotos, entrega de medalhas e muita alegria em família no nosso espaço reservado.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm">
              <Bus className="h-5 w-5 text-primary" />
              <span className="font-medium">Término previsto às 17:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Documentação */}
      <section id="documentacao" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Observação</h2>
            <p className="text-lg text-muted-foreground">
            </p>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-3">
              <Heart className="h-6 w-6 text-accent mt-1" />
              <div>
                <h4 className="font-semibold text-accent mb-2"></h4>
                <p className="text-sm">
                  A mãe poderá participar ao lado do pai, tornando o dia ainda mais completo!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
        
      {/* Custos e Pagamento */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Custos e Pagamento</h2>
            <p className="text-lg text-muted-foreground">
              Valor único para uma tarde inesquecível em família
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">R$ 70,00</CardTitle>
              <CardDescription>por aluno (inclui pai, mãe e filho)</CardDescription>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <UserPlus className="inline h-4 w-4 mr-1" />
                  <strong>Acompanhantes adicionais:</strong> R$ 20,00 cada 
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-accent">O que está incluído:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Todas as atividades e competições
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Lembrancinha especial para cada pai
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Pipoca e algodão-doce à vontade
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Decoração e ambientação completa
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Segurança e serviços de bombeiro civil
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      A mãe poderá participar ao lado do pai
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Cabine de fotos temáticas
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Entrega de medalhas para os pais presentes
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">Informações importantes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Pagamento obrigatório até 13 de agosto de 2025
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Aceita parcelamento em até 2x no cartão
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      O não comparecimento do aluno no dia do evento, não acarretará em reembolso.
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Lembrança e medalha, será somente para o pai. Os acompanhantes terão direito a fotos (juntamente com o pai), pipoca e algodão-doce, e claro, fazer parte desse dia especial junto à família.
                    </li>
                  </ul>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                {!showForm ? (
                  <Button 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    onClick={showInscricaoForm}
                  >
                    Realizar Inscrição e Pagamento
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar Formulário
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {!showForm ? 'Preencha seus dados e escolha a forma de pagamento' : 'Clique acima para fechar o formulário'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FORMULÁRIO DE INSCRIÇÃO - SHOW/HIDE */}
          {showForm && (
            <Card id="formulario-inscricao" className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <User className="mr-2 h-5 w-5" />
                  Formulário de Inscrição
                </CardTitle>
                <CardDescription>
                  Preencha todos os dados para garantir sua participação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Dados do Aluno */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Dados do Aluno
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                        <Input
                          id="studentName"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome completo do aluno"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentGrade">Série do Aluno *</Label>
                          <select
                            id="studentGrade"
                            name="studentGrade"
                            value={formData.studentGrade}
                            onChange={handleInputChange}
                            required
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="">Selecione a série</option>
                            <option value="Maternal II">Maternal II</option>
                            <option value="Maternal III">Maternal III</option>
                            <option value="Grupo 4">Grupo 4</option>
                            <option value="Grupo 5">Grupo 5</option>
                            <option value="1º Ano">1º Ano</option>
                            <option value="2º Ano">2º Ano</option>
                            <option value="3º Ano">3º Ano</option>
                            <option value="4º Ano">4º Ano</option>
                            <option value="5º Ano">5º Ano</option>
                            <option value="6º Ano">6º Ano</option>
                            <option value="7º Ano">7º Ano</option>
                            <option value="8º Ano">8º Ano</option>
                            <option value="9º Ano">9º Ano</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="studentClass">Turma do Aluno *</Label>
                          <Input
                            id="studentClass"
                            name="studentClass"
                            value={formData.studentClass}
                            onChange={handleInputChange}
                            required
                            placeholder="Ex: A, B, C"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Responsável */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      Dados do Responsável
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="parentName">Nome do Responsável *</Label>
                        <Input
                          id="parentName"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome completo do responsável"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="(84) 99999-9999"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF do Responsável *</Label>
                          <Input
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          required
                          placeholder="000.000.000-00"
                          maxLength="14"
                        />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Acompanhantes Adicionais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Acompanhantes Adicionais
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <p className="text-sm text-blue-800 mb-3">
                        O pacote básico já inclui <strong>pai, mãe e filho</strong>. Você pode adicionar até 5 acompanhantes extras por apenas R$ 20,00 cada.
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Label className="text-sm font-medium">Quantidade de acompanhantes adicionais:</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={decreaseCompanions}
                              disabled={formData.additionalCompanions === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {formData.additionalCompanions}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={increaseCompanions}
                              disabled={formData.additionalCompanions === 5}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {formData.additionalCompanions > 0 && (
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">
                              + R$ {(formData.additionalCompanions * 20).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {formData.additionalCompanions > 0 && (
                        <div className="mt-3 text-xs text-blue-700">
                          <strong>Total de pessoas no evento:</strong> {3 + formData.additionalCompanions} pessoas
                          <br />
                          <strong>Composição:</strong> Aluno + Pai + Mãe + {formData.additionalCompanions} acompanhante{formData.additionalCompanions > 1 ? 's' : ''} adicional{formData.additionalCompanions > 1 ? 'is' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Método de Pagamento*</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === 'pix' 
                            ? 'border-orange-400 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            formData.paymentMethod === 'pix' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'pix' && (
                              <div className="w-full h-full rounded-full bg-orange-400"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">PIX</span>
                            <span className="text-sm">
                              R$ {(70 + (formData.additionalCompanions * 20)).toFixed(2).replace('.', ',')} (sem taxas)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === 'credit' 
                            ? 'border-orange-400 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            formData.paymentMethod === 'credit' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'credit' && (
                              <div className="w-full h-full rounded-full bg-orange-400"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">💳</span>
                              <span className="text-sm font-medium">Cartão de Crédito (até 2x)</span>
                            </div>
                            <div className="text-xs text-gray-600 ml-6">                        
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
                          <option value={1}>1x de R$ {(valorTotal / 1).toFixed(2).replace('.', ',')}</option>
                          <option value={2}>2x de R$ {(valorTotal / 2).toFixed(2).replace('.', ',')}</option>
                        </select>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-orange-800 mb-1">Valor Total</h4>
                        <div className="text-2xl font-bold text-orange-900">
                          R$ {valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                          <div className="text-sm text-orange-700 mt-1">
                            {formData.installments}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {formData.additionalCompanions > 0 && (
                          <div className="text-xs text-orange-600 mt-2 border-t border-orange-200 pt-2">
                            <div>Pacote básico: R$ 70,00</div>
                            <div>Acompanhantes adicionais ({formData.additionalCompanions}x): R$ {(formData.additionalCompanions * 20).toFixed(2).replace('.', ',')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando Inscrição...
                      </>
                    ) : (
                      'CONTINUAR PARA PAGAMENTO'
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-600">
                    Ao finalizar, você será redirecionado para o pagamento via Asaas
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas conosco
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Telefone</CardTitle>
                    <CardDescription>Secretaria da escola</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">(84) 9 8145-0229</p>
                <p className="text-sm text-muted-foreground">
                  Horário de atendimento: 7h às 19h
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Coordenação Pedagógica</strong><br />
              Escola Centro Educacional Amadeus - São Gonçalo do Amarante, RN
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Escola Centro Educacional Amadeus. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 opacity-80">
            Passeio ao Game Station no Partage Shopping - 15 de Agosto de 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;



