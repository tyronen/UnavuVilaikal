import React from "react";
import { StyleSheet, Text, View, FlatList, ListItem, StatusBar, ActivityIndicator } from "react-native";
import { createStackNavigator } from "react-navigation";

const BASE_URL = 'http://192.168.0.19:4567';

class LoadingView extends React.Component {
  render() {
    return(
      <View style={styles.top}>
        <StatusBar
          translucent={true} />
        <Text style={styles.header}>{this.props.children}</Text>
        <ActivityIndicator />
      </View>
    );
  }
}

class OuterContainer extends React.Component {
  render() {
    return (
      <View style={styles.top}>
        <StatusBar
          translucent={true} />
        <Text style={styles.header}>{this.props.titleText}</Text>
        <View style={styles.container}>
          {this.props.children}
        </View>
        <Text style={styles.footer}>Add to Products</Text>
      </View>
    );
  }
}

class BaseScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true }
  }

  componentDidMount() {
    return fetch(this.url())
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          data: responseJson,
        }, function() {});
      }).catch((error) => {
        console.error(error);
      });
  }

  render() {
    if (this.state.isLoading) {
      return(
        <LoadingView>{this.titleText()}</LoadingView>
      );
    } else {
      return this.renderLoaded();
    }
  }
}

class HomeScreen extends BaseScreen {
  url() {
    return BASE_URL + '/main';
  }

  titleText() {
    return "Wholesale Prices";
  }

  renderLoaded() {
    return (
      <OuterContainer titleText={this.titleText()}>
        <View style={styles.column}>
          <Text style={styles.listTitle}>Products</Text>
          <FlatList
            data={this.state.data.products}
            renderItem={this.renderProduct}
            keyExtractor={(item, index) => item.ProductId}
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.listTitle}>Coops</Text>
          <FlatList
            data={this.state.data.cities}
            renderItem={this.renderCoop}
            keyExtractor={(item, index) => item.CoopCityEnglish}
          />
        </View>
      </OuterContainer>
    );
  }

  renderProduct = ({item}) => {
    return (
      <Text
        style={styles.listItem}
        onPress={() => {
          this.props.navigation.push('Products', {productId: item.ProductId});
        }
      }
      >
        {item.ProductNameEnglish}
      </Text>
    );
  }

  renderCoop = ({item}) => {
    return (
      <Text
        style={styles.listItem}
        onPress={() => {
          this.props.navigation.push('Coops', {city: item.CoopCityEnglish});
        }
       }
      >
        {item.CoopCityEnglish}
      </Text>
    );
  }
}

class ProductScreen extends BaseScreen {
  url() {
    const productId = this.props.navigation.getParam('productId','0');
    return BASE_URL + '/coops?product=' + productId;
  }

  titleText() {
    return 'Products';
  }

  renderLoaded() {
    return (
      <OuterContainer titleText={this.titleText()}>
        <FlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.ProductId}
        />
      </OuterContainer>
    );
  }

  renderItem = ({item}) => {
    return (
      <View style={styles.productContainer}>
        <View style={styles.row}>
          <Text style={styles.productName}>{item.ProductNameEnglish}</Text>
          <Text style={styles.productPrice}>Rs. {item.ProductUnitPrice}/{item.UnitOfMeasureNameEnglish}</Text>
        </View>
        <Text style={styles.coopName}>{item.CoopNameEnglish}</Text>
        <View style={styles.row}>
          <Text style={styles.address}>{item.CoopAddressEnglish}, {item.CoopCityEnglish}</Text>
          <Text style={styles.phoneNumber}>{item.CoopPhoneNumber}</Text>
        </View>
      </View>
    );
  }
}

class CoopScreen extends BaseScreen {
  getCity() {
    return this.props.navigation.getParam('city','');
  }

  url() {
    return BASE_URL + '/avail?city=' + this.getCity();
  }

  titleText() {
    return this.getCity() + ' Coops';
  }

  renderLoaded() {
    return (
      <OuterContainer titleText={this.titleText()}>
        <FlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.CoopId}
        />
      </OuterContainer>
    );
  }

  renderItem = ({item}) => {
    return (
      <View style={styles.productContainer}>
        <View style={styles.row}>
          <Text style={styles.productName}>{item.ProductNameEnglish}</Text>
          <Text style={styles.productPrice}>Rs. {item.ProductUnitPrice}/{item.UnitOfMeasureNameEnglish}</Text>
        </View>
        <Text style={styles.coopName}>{item.CoopNameEnglish}</Text>
        <View style={styles.row}>
          <Text style={styles.address}>{item.CoopAddressEnglish}, {item.CoopCityEnglish}</Text>
          <Text style={styles.phoneNumber}>{item.CoopPhoneNumber}</Text>
        </View>
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  { Home: HomeScreen, Products: ProductScreen, Coops: CoopScreen},
  { initialRouteName: 'Home',}
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
  header: {
    height: 47,
    fontSize: 28,
    fontWeight: "bold",
    backgroundColor: "#F7C4A2",
    padding: 5,
    textAlign: "center",
    padding: 5,
    paddingBottom: 12,
  },

  top: {
    flex: 1,
    backgroundColor: "#FFE38C",
    alignItems: "stretch",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    marginTop: 12,
    marginLeft: 6,
    marginRight: 6,
    flexDirection: "row",
  },

  column: {
    flex: 1,
  },

  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    height: 40,
    backgroundColor: "#4472c4",
    color: "red",
    margin: 3,
    padding: 3,
  },

  list: {
    flex: 1,
  },

  listItem: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#4472c4",
    color: "white",
    margin: 3,
    padding: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productContainer: {
    margin: 6,
    backgroundColor: "#4472c4",
    padding: 3,
  },

  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "right",
  },

  coopName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  address: {
    fontSize: 16,
    fontWeight: "bold",
  },

  phoneNumber: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  footer: {
    height: 40,
    fontSize: 24,
    fontWeight: "bold",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
