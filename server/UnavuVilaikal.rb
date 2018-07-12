require 'sinatra'
require 'json'
require 'mysql2'

set :bind, '0.0.0.0'

# Helper method to verify if a string is convertible to an integer
class String
  def is_int?
    self.to_i.to_s == self
  end
end

# Specify the formatting of decimal sql fields
class BigDecimal
  def to_json(*)
    to_s('F')
  end
end

Client = Mysql2::Client.new(
  :host => "localhost", :username => "root", :database => "jaffna")

def result_to_array(sql_results)
  array = []
  sql_results.each do |row|
    array << row
  end
  array
end

def simplequery(sql)
  result_to_array(Client.query(sql))
end

def detailsql()
  "SELECT DISTINCT
    p.ProductId, ProductNameEnglish, ProductUnitPrice, ProductUnitOfMeasureId,
    c.CoopId, CoopNameEnglish, CoopAddressEnglish, CoopVillageEnglish,
    CoopCityEnglish, CoopPhoneNumber, UnitOfMeasureNameEnglish
    FROM product p, cooperative c, product_cooperative pc, unitofmeasure u
    WHERE p.ProductId = pc.ProductId
    AND pc.CoopId = c.CoopId
    AND pc.ProductUnitOfMeasureId = u.UnitOfMeasureId "
  end

# All products and cities
get '/main' do
  combined = {}
  combined['products'] = simplequery("SELECT ProductId, ProductNameEnglish FROM product
               ORDER BY ProductNameEnglish")
  combined['cities'] = simplequery("SELECT DISTINCT CoopCityEnglish FROM cooperative
               ORDER BY CoopCityEnglish")
  JSON.generate(combined)
end

# All coops selling a product
get '/coops' do
  results = {}
  id = params['product']
  if id.is_int?
    stmt = Client.prepare(detailsql() + "AND pc.ProductId = ? ORDER BY CoopNameEnglish")
    results = stmt.execute(id)
  end
  JSON.generate(result_to_array(results))
end

# All products for sale in a city
get '/avail' do
  results = {}
  city = params['city']
  if city
    stmt = Client.prepare(detailsql() +"AND c.CoopCityEnglish = ? ORDER BY ProductNameEnglish, CoopNameEnglish")
    results = stmt.execute(city)
  end
  JSON.generate(result_to_array(results))
end

post '/newproduct' do

end
