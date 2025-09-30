import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Switch, Modal, Alert } from "react-native";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [requests, setRequests] = useState([
    {
      id: 1,
      client: "João Silva",
      total: 450,
      requestedDiscount: 15,
      reason: "Cliente solicitou 15% de desconto por ser cliente fiel há mais de 3 anos e fazer compras mensais regulares.",
      seller: "Carlos Santos",
      status: "pending",
      products: [
        { id: 1, name: "Smartphone Premium", price: 200, quantity: 1 },
        { id: 2, name: "Capinha Protetora", price: 50, quantity: 2 },
        { id: 3, name: "Fone Bluetooth", price: 200, quantity: 1 }
      ]
    },
    {
      id: 2,
      client: "Maria Oliveira", 
      total: 800,
      requestedDiscount: 10,
      reason: "Cliente pediu 10% de desconto por ser primeira compra na loja e estar com orçamento limitado.",
      seller: "Ana Costa",
      status: "pending",
      products: [
        { id: 1, name: "Notebook Gamer", price: 800, quantity: 1 }
      ]
    },
    {
      id: 3,
      client: "Empresa Tech Solutions",
      total: 1500,
      requestedDiscount: 8,
      reason: "Cliente corporativo com volume alto de compras, solicitando desconto para fechar contrato anual.",
      seller: "Pedro Almeida",
      status: "pending",
      products: [
        { id: 1, name: "Monitor 27\" 4K", price: 500, quantity: 2 },
        { id: 2, name: "Teclado Mecânico", price: 250, quantity: 1 },
        { id: 3, name: "Mouse Gamer", price: 150, quantity: 2 }
      ]
    },
    {
      id: 4,
      client: "Fernanda Costa",
      total: 320,
      requestedDiscount: 5,
      reason: "Cliente reclama de defeito em produto anterior e solicita desconto como compensação.",
      seller: "Mariana Lima",
      status: "pending",
      products: [
        { id: 1, name: "Tablet Android", price: 320, quantity: 1 }
      ]
    }
  ]);

  const [history, setHistory] = useState([
    {
      id: 101,
      client: "Empresa ABC Ltda",
      total: 1200,
      approvedDiscount: 12,
      finalValue: 1056,
      seller: "Pedro Almeida",
      status: "approved",
      date: "2024-01-15",
      products: [
        { id: 1, name: "Monitor 24\"", price: 400, quantity: 2 },
        { id: 2, name: "Teclado", price: 100, quantity: 1 }
      ],
      discountDetails: {
        type: 'percentage',
        value: 12,
        distribution: [
          { productId: 1, name: "Monitor 24\"", originalValue: 800, discountPercent: 12, discountValue: 96, finalValue: 704 },
          { productId: 2, name: "Teclado", originalValue: 100, discountPercent: 12, discountValue: 12, finalValue: 88 }
        ]
      }
    },
    {
      id: 102,
      client: "Roberto Lima",
      total: 300,
      approvedDiscount: 0,
      finalValue: 300,
      seller: "Carlos Santos",
      status: "rejected",
      reason: "Cliente não atende aos critérios para desconto especial.",
      date: "2024-01-14",
      products: [
        { id: 1, name: "Mouse Gamer", price: 150, quantity: 2 }
      ]
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvedDiscount, setApprovedDiscount] = useState('');
  const [discountType, setDiscountType] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [productDiscounts, setProductDiscounts] = useState({});
  const [discountInputType, setDiscountInputType] = useState('percentage');
  const [moneyDiscount, setMoneyDiscount] = useState('');

  const sellers = [
    { id: 1, name: "Carlos Santos", level: "Avançado", sales: 45 },
    { id: 2, name: "Ana Costa", level: "Intermediário", sales: 28 },
    { id: 3, name: "Pedro Almeida", level: "Avançado", sales: 52 },
    { id: 4, name: "Mariana Lima", level: "Iniciante", sales: 12 }
  ];

  // Função para converter entre porcentagem e valor em dinheiro
  const convertDiscount = (value, fromType, total) => {
    if (fromType === 'percentage') {
      const discountValue = total * (parseFloat(value) / 100);
      return {
        money: discountValue.toFixed(2),
        percentage: parseFloat(value).toFixed(1)
      };
    } else {
      const discountPercent = (parseFloat(value) / total) * 100;
      return {
        money: parseFloat(value).toFixed(2),
        percentage: discountPercent.toFixed(1)
      };
    }
  };

  // Função para calcular valores com desconto
  const calculateDiscountValues = (total, discountValue, inputType = 'percentage') => {
    let discountDecimal, discountValueMoney, finalValue;
    
    if (inputType === 'percentage') {
      discountDecimal = parseFloat(discountValue) / 100;
      discountValueMoney = total * discountDecimal;
      finalValue = total - discountValueMoney;
    } else {
      discountValueMoney = parseFloat(discountValue);
      discountDecimal = discountValueMoney / total;
      finalValue = total - discountValueMoney;
    }
    
    return {
      discountValue: discountValueMoney.toFixed(2),
      finalValue: finalValue.toFixed(2),
      discountPercent: (discountDecimal * 100).toFixed(1),
      isValid: !isNaN(discountDecimal) && discountDecimal >= 0 && discountDecimal <= 1 && discountValueMoney <= total
    };
  };

  // Função para calcular desconto distribuído automaticamente
  const calculateDistributedDiscount = (products, totalDiscount, inputType = 'percentage') => {
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    let totalDiscountValue;
    if (inputType === 'percentage') {
      totalDiscountValue = totalValue * (parseFloat(totalDiscount) / 100);
    } else {
      totalDiscountValue = parseFloat(totalDiscount);
    }

    const discountPerProduct = products.map(product => {
      const productValue = product.price * product.quantity;
      const productDiscountPercent = (productValue / totalValue) * (totalDiscountValue / totalValue * 100);
      const productDiscountValue = productValue * (productDiscountPercent / 100);
      const finalProductValue = productValue - productDiscountValue;
      
      return {
        ...product,
        discountPercent: productDiscountPercent.toFixed(1),
        discountValue: productDiscountValue.toFixed(2),
        finalValue: finalProductValue.toFixed(2),
        originalValue: productValue
      };
    });
    
    return discountPerProduct;
  };

  // Função para calcular desconto em produtos específicos
  const calculateSpecificDiscount = (products, discounts, inputType = 'percentage', totalDiscountValue = 0) => {
    let totalDiscountValueCalc = totalDiscountValue;
    let totalFinalValue = 0;
    
    const productsWithDiscount = products.map(product => {
      const productValue = product.price * product.quantity;
      let discountPercent, discountValue;
      
      if (inputType === 'percentage') {
        discountPercent = parseFloat(discounts[product.id] || 0);
        discountValue = productValue * (discountPercent / 100);
      } else {
        discountValue = parseFloat(discounts[product.id] || 0);
        discountPercent = (discountValue / productValue) * 100;
      }
      
      const finalValue = productValue - discountValue;
      totalFinalValue += finalValue;
      totalDiscountValueCalc += discountValue;
      
      return {
        ...product,
        discountPercent: discountPercent.toFixed(1),
        discountValue: discountValue.toFixed(2),
        finalValue: finalValue.toFixed(2),
        originalValue: productValue
      };
    });
    
    return {
      products: productsWithDiscount,
      totalDiscountValue: totalDiscountValueCalc.toFixed(2),
      totalFinalValue: totalFinalValue.toFixed(2),
      totalDiscountPercent: ((totalDiscountValueCalc / products.reduce((sum, p) => sum + (p.price * p.quantity), 0)) * 100).toFixed(1)
    };
  };

  // Função para atualizar desconto de um produto específico
  const updateProductDiscount = (productId, discount, inputType = 'percentage') => {
    setProductDiscounts(prev => ({
      ...prev,
      [productId]: discount
    }));
  };

  // Função para selecionar/deselecionar produto para desconto
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovedDiscount(request.requestedDiscount.toString());
    setMoneyDiscount('');
    setDiscountType('all');
    setDiscountInputType('percentage');
    setSelectedProducts([]);
    setProductDiscounts({});
    setRejectionReason('');
  };

  const handleViewHistory = (historyItem) => {
    setSelectedHistory(historyItem);
  };

  const handleViewSeller = (seller) => {
    setSelectedSeller(seller);
  };

  const confirmDecision = (approve) => {
    if (selectedRequest) {
      if (approve) {
        Alert.alert(
          "Confirmar Aprovação",
          `Tem certeza que deseja aprovar o desconto para ${selectedRequest.client}?`,
          [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Confirmar", 
              onPress: () => {
                let finalValue, approvedDiscountValue, discountDetails;
                
                if (discountType === 'all') {
                  const values = calculateDiscountValues(
                    selectedRequest.total, 
                    discountInputType === 'percentage' ? approvedDiscount : moneyDiscount,
                    discountInputType
                  );
                  
                  finalValue = parseFloat(values.finalValue);
                  approvedDiscountValue = parseFloat(discountInputType === 'percentage' ? approvedDiscount : values.discountPercent);
                  
                  // Calcular distribuição para histórico
                  const distributed = calculateDistributedDiscount(
                    selectedRequest.products, 
                    discountInputType === 'percentage' ? approvedDiscount : moneyDiscount,
                    discountInputType
                  );
                  
                  discountDetails = {
                    type: discountInputType,
                    value: discountInputType === 'percentage' ? parseFloat(approvedDiscount) : parseFloat(moneyDiscount),
                    distribution: distributed.map(product => ({
                      productId: product.id,
                      name: product.name,
                      originalValue: parseFloat(product.originalValue),
                      discountPercent: parseFloat(product.discountPercent),
                      discountValue: parseFloat(product.discountValue),
                      finalValue: parseFloat(product.finalValue)
                    }))
                  };
                } else {
                  const result = calculateSpecificDiscount(
                    selectedRequest.products.filter(p => selectedProducts.includes(p.id)),
                    productDiscounts,
                    discountInputType,
                    discountInputType === 'money' ? parseFloat(discountInputType === 'percentage' ? approvedDiscount : moneyDiscount) : 0
                  );
                  
                  finalValue = parseFloat(result.totalFinalValue);
                  approvedDiscountValue = parseFloat(result.totalDiscountPercent);
                  
                  discountDetails = {
                    type: discountInputType,
                    value: discountInputType === 'percentage' ? parseFloat(approvedDiscount) : parseFloat(moneyDiscount),
                    distribution: result.products.map(product => ({
                      productId: product.id,
                      name: product.name,
                      originalValue: parseFloat(product.originalValue),
                      discountPercent: parseFloat(product.discountPercent),
                      discountValue: parseFloat(product.discountValue),
                      finalValue: parseFloat(product.finalValue)
                    }))
                  };
                }
                
                const newHistoryItem = {
                  ...selectedRequest,
                  id: Date.now(),
                  approvedDiscount: approvedDiscountValue,
                  finalValue: finalValue,
                  status: "approved",
                  date: new Date().toISOString().split('T')[0],
                  discountDetails: discountDetails
                };
                
                setHistory([newHistoryItem, ...history]);
                setRequests(requests.filter(r => r.id !== selectedRequest.id));
                setSelectedRequest(null);
                alert(`Desconto aprovado com sucesso!`);
              }
            }
          ]
        );
      } else {
        if (!rejectionReason.trim()) {
          alert('Por favor, informe o motivo da recusa.');
          return;
        }
        
        Alert.alert(
          "Confirmar Recusa",
          `Tem certeza que deseja recusar o desconto para ${selectedRequest.client}?`,
          [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Confirmar", 
              onPress: () => {
                const newHistoryItem = {
                  ...selectedRequest,
                  id: Date.now(),
                  approvedDiscount: 0,
                  finalValue: selectedRequest.total,
                  status: "rejected",
                  reason: rejectionReason,
                  date: new Date().toISOString().split('T')[0]
                };
                
                setHistory([newHistoryItem, ...history]);
                setRequests(requests.filter(r => r.id !== selectedRequest.id));
                setSelectedRequest(null);
                setRejectionReason('');
                alert('Solicitação recusada com sucesso!');
              }
            }
          ]
        );
      }
    }
  };

  const deleteHistoryItem = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const editHistoryItem = (item) => {
    alert('Funcionalidade de edição em desenvolvimento');
  };

  // Estilos dinâmicos para modo escuro
  const dynamicStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5' 
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: 20, 
      backgroundColor: darkMode ? '#2d2d2d' : 'white',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#444' : '#eee'
    },
    headerTitle: { 
      fontSize: 20, 
      fontWeight: 'bold',
      color: darkMode ? 'white' : 'black'
    },
    content: { 
      flex: 1, 
      padding: 16,
      backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
    },
    card: {
      backgroundColor: darkMode ? '#2d2d2d' : 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    text: {
      color: darkMode ? 'white' : 'black'
    },
    secondaryText: {
      color: darkMode ? '#ccc' : '#666'
    }
  });

  // TELA DE LOGIN
  if (currentScreen === 'login') {
    return (
      <View style={dynamicStyles.container}>
        <Text style={[styles.title, {color: darkMode ? 'white' : '#007AFF'}]}>Sistema Gerencial</Text>
        <Text style={[styles.subtitle, {color: darkMode ? '#ccc' : '#666'}]}>Controle de Descontos</Text>

        <View style={dynamicStyles.card}>
          <Text style={[styles.loginTitle, dynamicStyles.text]}>Login do Gerente</Text>
          
          <TextInput
            style={[styles.input, dynamicStyles.text, {backgroundColor: darkMode ? '#3d3d3d' : 'white'}]}
            placeholder="E-mail"
            placeholderTextColor={darkMode ? '#999' : '#999'}
          />

          <TextInput
            style={[styles.input, dynamicStyles.text, {backgroundColor: darkMode ? '#3d3d3d' : 'white'}]}
            placeholder="Senha"
            placeholderTextColor={darkMode ? '#999' : '#999'}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={[styles.demoText, {color: darkMode ? '#ccc' : '#666'}]}>Use qualquer e-mail/senha para teste</Text>
        </View>
      </View>
    );
  }

  // TELA DE DASHBOARD
  if (currentScreen === 'dashboard') {
    const totalSales = history.filter(item => item.status === 'approved').length;
    const totalRevenue = history
      .filter(item => item.status === 'approved')
      .reduce((sum, item) => sum + item.finalValue, 0);

    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Dashboard Gerencial</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content}>
          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={dynamicStyles.card}>
              <Text style={[styles.statNumber, dynamicStyles.text]}>{requests.length}</Text>
              <Text style={[styles.statLabel, dynamicStyles.secondaryText]}>Solicitações</Text>
            </View>
            <View style={dynamicStyles.card}>
              <Text style={[styles.statNumber, dynamicStyles.text]}>R$ {totalRevenue}</Text>
              <Text style={[styles.statLabel, dynamicStyles.secondaryText]}>Faturamento</Text>
            </View>
            <View style={dynamicStyles.card}>
              <Text style={[styles.statNumber, dynamicStyles.text]}>{totalSales}</Text>
              <Text style={[styles.statLabel, dynamicStyles.secondaryText]}>Vendas Hoje</Text>
            </View>
          </View>

          {/* Botões de Navegação */}
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentScreen('requests')}
            >
              <Text style={styles.navButtonText}>Ver Solicitações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentScreen('settings')}
            >
              <Text style={styles.navButtonText}>Configurações</Text>
            </TouchableOpacity>
          </View>

          {/* Histórico - CORREÇÃO APLICADA: TODOS OS ITENS MOSTRAM BOTÕES IGUALMENTE */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Histórico</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('history')}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {history.slice(0, 3).map((item) => (
            <View key={item.id} style={dynamicStyles.card}>
              <View style={styles.historyItemHeader}>
                <Text style={[styles.clientName, dynamicStyles.text]}>{item.client}</Text>
                <Text style={[
                  styles.statusBadge, 
                  item.status === 'approved' ? styles.approvedBadge : styles.rejectedBadge
                ]}>
                  {item.status === 'approved' ? 'Aprovado' : 'Recusado'}
                </Text>
              </View>
              <Text style={[styles.secondaryText, dynamicStyles.secondaryText]}>
                Vendedor: {item.seller} • {item.date}
              </Text>
              <Text style={[styles.secondaryText, dynamicStyles.secondaryText]}>
                Total: R$ {item.finalValue} {item.status === 'approved' && `(${item.approvedDiscount}% desc)`}
              </Text>
              
              {/* CORREÇÃO: BOTÕES SEMPRE VISÍVEIS E FUNCIONAIS PARA TODAS AS TRANSAÇÕES */}
              <View style={styles.historyActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => editHistoryItem(item)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      "Confirmar Exclusão",
                      `Tem certeza que deseja excluir a transação de ${item.client}?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        { 
                          text: "Confirmar", 
                          onPress: () => deleteHistoryItem(item.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Apagar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.detailsButton]}
                  onPress={() => handleViewHistory(item)}
                >
                  <Text style={styles.actionButtonText}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Modal de Detalhes do Histórico */}
        {selectedHistory && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, {backgroundColor: darkMode ? '#2d2d2d' : 'white'}]}>
                <Text style={[styles.modalTitle, dynamicStyles.text]}>Detalhes da Transação</Text>
                
                <Text style={[dynamicStyles.text, styles.modalText]}>Cliente: {selectedHistory.client}</Text>
                <Text style={[dynamicStyles.secondaryText, styles.modalText]}>Vendedor: {selectedHistory.seller}</Text>
                <Text style={[dynamicStyles.secondaryText, styles.modalText]}>Data: {selectedHistory.date}</Text>
                <Text style={[dynamicStyles.text, styles.modalText]}>
                  Status: <Text style={selectedHistory.status === 'approved' ? styles.approvedBadge : styles.rejectedBadge}>
                    {selectedHistory.status === 'approved' ? 'Aprovado' : 'Recusado'}
                  </Text>
                </Text>
                
                {selectedHistory.status === 'approved' && (
                  <>
                    <Text style={[dynamicStyles.text, styles.modalText]}>
                      Desconto Aplicado: {selectedHistory.approvedDiscount}%
                    </Text>
                    
                    {/* Detalhes da aplicação do desconto */}
                    {selectedHistory.discountDetails && (
                      <View style={styles.discountDetails}>
                        <Text style={[styles.discountDetailsTitle, dynamicStyles.text]}>
                          Como o desconto foi aplicado:
                        </Text>
                        <Text style={[dynamicStyles.secondaryText, styles.modalText]}>
                          Tipo: {selectedHistory.discountDetails.type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                        </Text>
                        <Text style={[dynamicStyles.secondaryText, styles.modalText]}>
                          Valor: {selectedHistory.discountDetails.type === 'percentage' 
                            ? `${selectedHistory.discountDetails.value}%` 
                            : `R$ ${selectedHistory.discountDetails.value}`
                          }
                        </Text>
                        
                        <Text style={[styles.productsTitle, dynamicStyles.text]}>Distribuição por produto:</Text>
                        {selectedHistory.discountDetails.distribution.map((product, index) => (
                          <View key={index} style={styles.productDistribution}>
                            <Text style={[dynamicStyles.text, styles.productName]}>{product.name}</Text>
                            <View style={styles.distributionRow}>
                              <Text style={[dynamicStyles.secondaryText, styles.distributionText]}>
                                Original: R$ {product.originalValue.toFixed(2)}
                              </Text>
                              <Text style={[dynamicStyles.secondaryText, styles.distributionText]}>
                                -{product.discountPercent}% (R$ {product.discountValue.toFixed(2)})
                              </Text>
                              <Text style={[dynamicStyles.text, styles.finalValueText]}>
                                Final: R$ {product.finalValue.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
                
                {selectedHistory.status === 'rejected' && selectedHistory.reason && (
                  <Text style={[dynamicStyles.text, styles.modalText]}>
                    Motivo da Recusa: {selectedHistory.reason}
                  </Text>
                )}

                <Text style={[styles.productsTitle, dynamicStyles.text]}>Produtos:</Text>
                {selectedHistory.products.map((product, index) => (
                  <Text key={index} style={[dynamicStyles.secondaryText, styles.modalText]}>
                    • {product.name} - R$ {product.price} x {product.quantity}
                  </Text>
                ))}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => editHistoryItem(selectedHistory)}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => {
                      deleteHistoryItem(selectedHistory.id);
                      setSelectedHistory(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Apagar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.closeButton]}
                    onPress={() => setSelectedHistory(null)}
                  >
                    <Text style={styles.buttonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // TELA DE SOLICITAÇÕES
  if (currentScreen === 'requests') {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Solicitações de Desconto</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content}>
          {requests.map((request) => (
            <View key={request.id} style={dynamicStyles.card}>
              <Text style={[styles.clientName, dynamicStyles.text]}>{request.client}</Text>
              <Text style={[styles.sellerInfo, dynamicStyles.secondaryText]}>Vendedor: {request.seller}</Text>
              <Text style={[styles.totalInfo, dynamicStyles.text]}>Total: R$ {request.total},00</Text>
              
              <Text style={[styles.reasonTitle, dynamicStyles.text]}>Motivo do desconto:</Text>
              <Text style={[styles.reasonText, dynamicStyles.secondaryText]}>"{request.reason}"</Text>

              <TouchableOpacity 
                style={styles.reviewButton}
                onPress={() => handleApprove(request)}
              >
                <Text style={styles.reviewButtonText}>Analisar Solicitação</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Modal de Análise ATUALIZADO */}
        {selectedRequest && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={false}
          >
            <View style={dynamicStyles.container}>
              <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>Analisar Solicitação</Text>
                <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                  <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={dynamicStyles.content}>
                <View style={dynamicStyles.card}>
                  <Text style={[styles.clientName, dynamicStyles.text]}>{selectedRequest.client}</Text>
                  <Text style={[styles.sellerInfo, dynamicStyles.secondaryText]}>Vendedor: {selectedRequest.seller}</Text>
                  <Text style={[styles.totalInfo, dynamicStyles.text]}>Valor original: R$ {selectedRequest.total},00</Text>
                  
                  <Text style={[styles.reasonTitle, dynamicStyles.text]}>Motivo:</Text>
                  <Text style={[styles.reasonText, dynamicStyles.secondaryText]}>"{selectedRequest.reason}"</Text>

                  <Text style={[styles.productsTitle, dynamicStyles.text]}>Produtos do Pedido:</Text>
                  {selectedRequest.products.map((product, index) => (
                    <Text key={index} style={[dynamicStyles.secondaryText, styles.productDetail]}>
                      • {product.name} - R$ {product.price} x {product.quantity} = R$ {(product.price * product.quantity).toFixed(2)}
                    </Text>
                  ))}
                </View>

                <View style={dynamicStyles.card}>
                  <Text style={[styles.approveTitle, dynamicStyles.text]}>Desconto solicitado: {selectedRequest.requestedDiscount}%</Text>
                  
                  {/* Seleção do tipo de input do desconto */}
                  <View style={styles.discountInputTypeContainer}>
                    <Text style={[styles.discountTypeTitle, dynamicStyles.text]}>Digitar desconto como:</Text>
                    <View style={styles.discountInputTypeButtons}>
                      <TouchableOpacity 
                        style={[styles.discountInputTypeButton, discountInputType === 'percentage' && styles.discountInputTypeButtonActive]}
                        onPress={() => setDiscountInputType('percentage')}
                      >
                        <Text style={[styles.discountInputTypeButtonText, discountInputType === 'percentage' && styles.discountInputTypeButtonTextActive]}>
                          Porcentagem
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.discountInputTypeButton, discountInputType === 'money' && styles.discountInputTypeButtonActive]}
                        onPress={() => setDiscountInputType('money')}
                      >
                        <Text style={[styles.discountInputTypeButtonText, discountInputType === 'money' && styles.discountInputTypeButtonTextActive]}>
                          Valor em R$
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Input do desconto baseado no tipo selecionado */}
                  <View style={styles.discountInputContainer}>
                    {discountInputType === 'percentage' ? (
                      <TextInput
                        style={[styles.input, dynamicStyles.text, {backgroundColor: darkMode ? '#3d3d3d' : 'white'}]}
                        placeholder="Digite a porcentagem de desconto"
                        keyboardType="numeric"
                        value={approvedDiscount}
                        onChangeText={setApprovedDiscount}
                      />
                    ) : (
                      <TextInput
                        style={[styles.input, dynamicStyles.text, {backgroundColor: darkMode ? '#3d3d3d' : 'white'}]}
                        placeholder="Digite o valor do desconto em R$"
                        keyboardType="numeric"
                        value={moneyDiscount}
                        onChangeText={setMoneyDiscount}
                      />
                    )}
                    
                    {/* Conversão automática */}
                    {(approvedDiscount || moneyDiscount) && (() => {
                      const conversion = convertDiscount(
                        discountInputType === 'percentage' ? approvedDiscount : moneyDiscount,
                        discountInputType,
                        selectedRequest.total
                      );
                      
                      return (
                        <Text style={[styles.conversionText, dynamicStyles.secondaryText]}>
                          {discountInputType === 'percentage' 
                            ? `Equivale a: R$ ${conversion.money}`
                            : `Equivale a: ${conversion.percentage}%`
                          }
                        </Text>
                      );
                    })()}
                  </View>

                  {/* CORREÇÃO: Opção de tipo de desconto - LÓGICA SIMPLIFICADA E FUNCIONAL */}
                  <View style={styles.discountTypeContainer}>
                    <Text style={[styles.discountTypeTitle, dynamicStyles.text]}>Aplicar desconto em:</Text>
                    <View style={styles.discountTypeButtons}>
                      <TouchableOpacity 
                        style={[styles.discountTypeButton, discountType === 'all' && styles.discountTypeButtonActive]}
                        onPress={() => setDiscountType('all')}
                      >
                        <Text style={[styles.discountTypeButtonText, discountType === 'all' && styles.discountTypeButtonTextActive]}>
                          Todo o carrinho
                        </Text>
                      </TouchableOpacity>
                      
                      {/* CORREÇÃO: Botão "Produtos específicos" SEMPRE FUNCIONAL */}
                      <TouchableOpacity 
                        style={[
                          styles.discountTypeButton, 
                          discountType === 'specific' && styles.discountTypeButtonActive,
                          selectedRequest.products.length === 1 && styles.disabledButton
                        ]}
                        onPress={() => {
                          if (selectedRequest.products.length > 1) {
                            setDiscountType('specific');
                          } else {
                            // Para pedidos com 1 produto, permite selecionar mas mostra mensagem
                            setDiscountType('specific');
                            Alert.alert(
                              "Apenas 1 Produto",
                              "Este pedido contém apenas 1 produto. A opção 'Produtos específicos' funcionará da mesma forma que 'Todo o carrinho'.",
                              [{ text: "Entendi" }]
                            );
                          }
                        }}
                      >
                        <Text style={[
                          styles.discountTypeButtonText, 
                          discountType === 'specific' && styles.discountTypeButtonTextActive,
                          selectedRequest.products.length === 1 && styles.disabledButtonText
                        ]}>
                          Produtos específicos
                          {selectedRequest.products.length === 1 && ' (1 produto)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Cálculo do desconto distribuído */}
                  {(approvedDiscount || moneyDiscount) && discountType === 'all' && (() => {
                    const values = calculateDiscountValues(
                      selectedRequest.total, 
                      discountInputType === 'percentage' ? approvedDiscount : moneyDiscount,
                      discountInputType
                    );
                    
                    if (!values.isValid) {
                      return <Text style={styles.errorText}>Valor de desconto inválido</Text>;
                    }

                    // Para pedidos com múltiplos produtos, mostrar distribuição editável
                    if (selectedRequest.products.length > 1) {
                      const distributed = calculateDistributedDiscount(
                        selectedRequest.products, 
                        discountInputType === 'percentage' ? approvedDiscount : moneyDiscount,
                        discountInputType
                      );
                      
                      return (
                        <View style={styles.calculationCard}>
                          <Text style={styles.calculationTitle}>DISTRIBUIÇÃO DO DESCONTO (EDITÁVEL):</Text>
                          {distributed.map((product, index) => (
                            <View key={index} style={styles.productDiscountRow}>
                              <View style={styles.productInfo}>
                                <Text style={styles.calculationText}>{product.name}</Text>
                                <Text style={styles.productValueText}>
                                  R$ {product.originalValue.toFixed(2)}
                                </Text>
                              </View>
                              <View style={styles.discountInputContainer}>
                                <TextInput
                                  style={styles.discountInput}
                                  keyboardType="numeric"
                                  value={productDiscounts[product.id] || product.discountPercent}
                                  onChangeText={(value) => updateProductDiscount(product.id, value, 'percentage')}
                                  placeholder="%"
                                />
                                <Text style={styles.percentSymbol}>%</Text>
                              </View>
                              <Text style={styles.discountValueText}>
                                R$ {product.discountValue}
                              </Text>
                            </View>
                          ))}
                          <Text style={[styles.calculationText, styles.finalValueText]}>
                            Total com desconto: R$ {values.finalValue}
                          </Text>
                        </View>
                      );
                    } else {
                      // Para pedido com um único produto
                      return (
                        <View style={styles.calculationCard}>
                          <Text style={styles.calculationTitle}>VALOR FINAL:</Text>
                          <Text style={styles.calculationText}>
                            Desconto {discountInputType === 'percentage' ? `${approvedDiscount}%` : `R$ ${moneyDiscount}`}
                          </Text>
                          <Text style={styles.calculationText}>
                            Valor do desconto: R$ {values.discountValue}
                          </Text>
                          <Text style={[styles.calculationText, styles.finalValueText]}>
                            Total: R$ {values.finalValue}
                          </Text>
                        </View>
                      );
                    }
                  })()}

                  {/* Seleção de produtos específicos para desconto - AGORA FUNCIONAL PARA 1 PRODUTO TAMBÉM */}
                  {(approvedDiscount || moneyDiscount) && discountType === 'specific' && (
                    <View style={styles.specificDiscountContainer}>
                      <Text style={[styles.calculationTitle, dynamicStyles.text]}>
                        {selectedRequest.products.length === 1 
                          ? "Produto único (seleção automática):"
                          : "Selecione os produtos para aplicar desconto:"
                        }
                      </Text>
                      
                      {selectedRequest.products.map((product, index) => (
                        <View key={product.id} style={styles.productSelectionRow}>
                          <TouchableOpacity 
                            style={[
                              styles.productCheckbox,
                              (selectedProducts.includes(product.id) || selectedRequest.products.length === 1) && styles.productCheckboxSelected
                            ]}
                            onPress={() => {
                              if (selectedRequest.products.length > 1) {
                                toggleProductSelection(product.id);
                              }
                            }}
                          >
                            {(selectedProducts.includes(product.id) || selectedRequest.products.length === 1) && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </TouchableOpacity>
                          
                          <View style={styles.productInfo}>
                            <Text style={[dynamicStyles.text, styles.productName]}>{product.name}</Text>
                            <Text style={[dynamicStyles.secondaryText, styles.productValue]}>
                              R$ {(product.price * product.quantity).toFixed(2)}
                            </Text>
                          </View>
                          
                          {(selectedProducts.includes(product.id) || selectedRequest.products.length === 1) && (
                            <View style={styles.discountInputContainer}>
                              <TextInput
                                style={[styles.discountInput, {color: darkMode ? 'white' : 'black'}]}
                                keyboardType="numeric"
                                placeholder="0"
                                value={productDiscounts[product.id] || ''}
                                onChangeText={(value) => updateProductDiscount(
                                  product.id, 
                                  value, 
                                  discountInputType
                                )}
                              />
                              <Text style={[styles.percentSymbol, dynamicStyles.text]}>
                                {discountInputType === 'percentage' ? '%' : 'R$'}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}

                      {/* Cálculo do desconto específico */}
                      {(selectedProducts.length > 0 || selectedRequest.products.length === 1) && (() => {
                        const productsToCalculate = selectedRequest.products.length === 1 
                          ? selectedRequest.products 
                          : selectedRequest.products.filter(p => selectedProducts.includes(p.id));
                        
                        const result = calculateSpecificDiscount(
                          productsToCalculate,
                          productDiscounts,
                          discountInputType
                        );
                        
                        return (
                          <View style={styles.calculationCard}>
                            <Text style={styles.calculationTitle}>RESUMO DO DESCONTO:</Text>
                            {result.products.map((product, index) => (
                              <Text key={index} style={styles.calculationText}>
                                {product.name}: {discountInputType === 'percentage' ? `${product.discountPercent}%` : `R$ ${product.discountValue}`} 
                                {discountInputType === 'money' && ` (${product.discountPercent}%)`}
                              </Text>
                            ))}
                            <Text style={[styles.calculationText, styles.finalValueText]}>
                              Total com desconto: R$ {result.totalFinalValue}
                            </Text>
                            <Text style={styles.calculationText}>
                              Desconto total: {discountInputType === 'percentage' ? `${result.totalDiscountPercent}%` : `R$ ${result.totalDiscountValue}`}
                              {discountInputType === 'money' && ` (${result.totalDiscountPercent}%)`}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>

                {/* Campo para motivo da recusa */}
                <View style={dynamicStyles.card}>
                  <Text style={[styles.reasonTitle, dynamicStyles.text]}>Motivo da recusa (se aplicável):</Text>
                  <TextInput
                    style={[styles.textArea, dynamicStyles.text, {backgroundColor: darkMode ? '#3d3d3d' : 'white'}]}
                    placeholder="Informe o motivo da recusa..."
                    multiline
                    numberOfLines={3}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={() => confirmDecision(false)}
                  >
                    <Text style={styles.buttonText}>Recusar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={() => confirmDecision(true)}
                  >
                    <Text style={styles.buttonText}>Aprovar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // TELA DE CONFIGURAÇÕES
  if (currentScreen === 'settings') {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Configurações</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content}>
          <View style={dynamicStyles.card}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Aparência</Text>
            <View style={styles.settingItem}>
              <Text style={dynamicStyles.text}>Modo Escuro</Text>
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={dynamicStyles.card}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Vendedores Cadastrados</Text>
            {sellers.map((seller) => (
              <TouchableOpacity
                key={seller.id}
                style={styles.sellerItem}
                onPress={() => handleViewSeller(seller)}
              >
                <View>
                  <Text style={[styles.sellerName, dynamicStyles.text]}>{seller.name}</Text>
                  <Text style={[styles.sellerInfo, dynamicStyles.secondaryText]}>
                    Nível: {seller.level} • Vendas: {seller.sales}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Modal de Detalhes do Vendedor */}
        {selectedSeller && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, {backgroundColor: darkMode ? '#2d2d2d' : 'white'}]}>
                <Text style={[styles.modalTitle, dynamicStyles.text]}>Perfil do Vendedor</Text>
                
                <Text style={[dynamicStyles.text, styles.modalText]}>Nome: {selectedSeller.name}</Text>
                <Text style={[dynamicStyles.text, styles.modalText]}>Nível: {selectedSeller.level}</Text>
                <Text style={[dynamicStyles.text, styles.modalText]}>Total de Vendas: {selectedSeller.sales}</Text>
                
                <Text style={[styles.productsTitle, dynamicStyles.text]}>Histórico Recente:</Text>
                {history
                  .filter(item => item.seller === selectedSeller.name)
                  .slice(0, 5)
                  .map((item, index) => (
                    <Text key={index} style={[dynamicStyles.secondaryText, styles.modalText]}>
                      • {item.client} - R$ {item.finalValue} ({item.status === 'approved' ? 'Aprovado' : 'Recusado'})
                    </Text>
                  ))}

                <TouchableOpacity 
                  style={[styles.closeSellerButton, styles.closeButton]}
                  onPress={() => setSelectedSeller(null)}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // TELA DE HISTÓRICO COMPLETO
  if (currentScreen === 'history') {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Histórico Completo</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content}>
          {history.map((item) => (
            <View key={item.id} style={dynamicStyles.card}>
              <View style={styles.historyItemHeader}>
                <Text style={[styles.clientName, dynamicStyles.text]}>{item.client}</Text>
                <Text style={[
                  styles.statusBadge, 
                  item.status === 'approved' ? styles.approvedBadge : styles.rejectedBadge
                ]}>
                  {item.status === 'approved' ? 'Aprovado' : 'Recusado'}
                </Text>
              </View>
              <Text style={[styles.secondaryText, dynamicStyles.secondaryText]}>
                Vendedor: {item.seller} • {item.date}
              </Text>
              <Text style={[styles.secondaryText, dynamicStyles.secondaryText]}>
                Total: R$ {item.finalValue} {item.status === 'approved' && `(${item.approvedDiscount}% desc)`}
              </Text>
              
              <View style={styles.historyActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => editHistoryItem(item)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      "Confirmar Exclusão",
                      `Tem certeza que deseja excluir a transação de ${item.client}?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        { 
                          text: "Confirmar", 
                          onPress: () => deleteHistoryItem(item.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Apagar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.detailsButton]}
                  onPress={() => handleViewHistory(item)}
                >
                  <Text style={styles.actionButtonText}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

// Estilos base (sem cores dinâmicas)
const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', marginTop: 50 },
  subtitle: { fontSize: 16, marginBottom: 50, textAlign: 'center' },
  loginTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 5, 
    padding: 15, 
    marginBottom: 15,
    fontSize: 16
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top'
  },
  loginButton: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 5, 
    alignItems: 'center',
    marginTop: 10
  },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  demoText: { marginTop: 20, fontSize: 12, textAlign: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 12 },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, flex: 1, margin: 5, alignItems: 'center' },
  navButtonText: { color: 'white', fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllText: { color: '#007AFF', fontWeight: 'bold' },
  clientName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sellerInfo: { fontSize: 14, marginBottom: 5, fontStyle: 'italic' },
  totalInfo: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  discountRequested: { color: '#FF9500', fontWeight: 'bold', marginVertical: 5 },
  reasonTitle: { fontWeight: 'bold', marginTop: 10 },
  reasonText: { marginBottom: 10, fontStyle: 'italic' },
  productsTitle: { fontWeight: 'bold', marginTop: 10 },
  product: { marginLeft: 10, marginBottom: 3 },
  productDetail: { marginLeft: 10, marginBottom: 5 },
  reviewButton: { 
    backgroundColor: '#007AFF', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10,
    alignItems: 'center'
  },
  reviewButtonText: { color: 'white', fontWeight: 'bold' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold' },
  backText: { color: '#007AFF', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    maxHeight: '80%',
    width: '90%'
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalText: { marginBottom: 8, fontSize: 14 },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15,
    flexWrap: 'wrap'
  },
  modalButton: { 
    padding: 12, 
    borderRadius: 5, 
    alignItems: 'center',
    margin: 4,
    minWidth: 80
  },
  rejectButton: { backgroundColor: '#FF3B30' },
  approveButton: { backgroundColor: '#34C759' },
  editButton: { backgroundColor: '#FF9500' },
  deleteButton: { backgroundColor: '#FF3B30' },
  closeButton: { backgroundColor: '#8E8E93' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  historyItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  approvedBadge: { backgroundColor: '#d4edda', color: '#155724' },
  rejectedBadge: { backgroundColor: '#f8d7da', color: '#721c24' },
  detailsButton: { 
    backgroundColor: '#007AFF', 
    padding: 8, 
    borderRadius: 5, 
    alignItems: 'center',
    marginTop: 10
  },
  detailsButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  historyActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionButton: { 
    padding: 8, 
    borderRadius: 5, 
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2
  },
  actionButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  sellerItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sellerName: { fontSize: 16, fontWeight: 'bold' },
  arrow: { fontSize: 18, color: '#007AFF' },

  // Estilos para conversão de valores
  approveTitle: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 10 },
  calculationCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5
  },
  calculationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3
  },
  finalValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center'
  },

  // Estilos para seleção de tipo de desconto
  discountTypeContainer: {
    marginVertical: 15
  },
  discountTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  discountTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  discountTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    alignItems: 'center'
  },
  discountTypeButtonActive: {
    backgroundColor: '#007AFF'
  },
  discountTypeButtonText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center'
  },
  discountTypeButtonTextActive: {
    color: 'white',
    fontWeight: 'bold'
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6
  },
  disabledButtonText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center'
  },

  // Novos estilos para desconto em produtos específicos
  specificDiscountContainer: {
    marginTop: 10
  },
  productSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  productCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  productCheckboxSelected: {
    backgroundColor: '#007AFF'
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  productValue: {
    fontSize: 12
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  discountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 5,
    width: 50,
    textAlign: 'center',
    marginLeft: 10
  },
  percentSymbol: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold'
  },

  // Estilos para edição de desconto distribuído
  productDiscountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  productValueText: {
    fontSize: 12,
    color: '#666'
  },
  discountValueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34C759',
    minWidth: 60,
    textAlign: 'right'
  },

  // Estilo para botão fechar menor
  closeSellerButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
    minWidth: 100
  },

  // Novos estilos para input de desconto em dinheiro
  discountInputTypeContainer: {
    marginVertical: 10
  },
  discountInputTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  discountInputTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    alignItems: 'center'
  },
  discountInputTypeButtonActive: {
    backgroundColor: '#007AFF'
  },
  discountInputTypeButtonText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center'
  },
  discountInputTypeButtonTextActive: {
    color: 'white',
    fontWeight: 'bold'
  },
  conversionText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center'
  },

  // Estilos para detalhes da distribuição no histórico
  discountDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  discountDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8
  },
  productDistribution: {
    marginBottom: 8,
    padding: 5
  },
  distributionRow: {
    marginLeft: 10
  },
  distributionText: {
    fontSize: 12
  }
});